import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            hasApiKey: Boolean(process.env.GEMINI_API_KEY),
            time: new Date().toISOString(),
          })
        );
      });

      server.middlewares.use('/api/analyze-image', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            res.statusCode = 503;
            res.end(
              JSON.stringify({
                success: false,
                error: 'GEMINI_API_KEY not configured on server. Please use manual entry.',
                fallback: true,
              })
            );
            return;
          }

          try {
            const { GoogleGenAI } = await import('@google/genai');
            const parsed = JSON.parse(body || '{}');
            const base64Data = (parsed.imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
            const mimeType = parsed.mimeType || 'image/jpeg';

            if (!base64Data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'No image data provided' }));
              return;
            }

            const ai = new GoogleGenAI();
            const response = await ai.models.generateContent({
              model: 'gemini-3.5-flash-lite',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType,
                      },
                    },
                    {
                      text: `You are the scrap and materials recognition engine for SCRAPSHIFT.
Inspect this photograph of salvage, scrap, or repurposed equipment carefully.
Detect the primary objects, housings, materials, or components shown (e.g. if you see a VR headset, goggles, lenses, straps, cardboard, electronics, wires, wood, plastic containers, etc.).
Return ONLY valid JSON matching this exact schema:
{
  "detectedMaterials": [
    {
      "name": "string (e.g. 'VR Headset Enclosure' or 'Biconvex Optical Lenses')",
      "category": "cardboard" | "plastic" | "glass" | "metal" | "wood" | "fabric" | "electronics" | "other",
      "quantity": "string (e.g. '1 headset unit' or '2 lenses')",
      "condition": "clean_scrap" | "used_good" | "damaged" | "raw_remnant",
      "notes": "string (brief note about structural properties or wear)"
    }
  ],
  "summary": "string (1-2 sentence description of what was identified in the photo)"
}`,
                    },
                  ],
                },
              ],
              config: { responseMimeType: 'application/json' },
            });

            const text = response.text || '{}';
            const data = JSON.parse(text);

            if (data.detectedMaterials && Array.isArray(data.detectedMaterials)) {
              res.end(JSON.stringify({ success: true, materials: data.detectedMaterials, summary: data.summary || '' }));
              return;
            }

            res.statusCode = 422;
            res.end(JSON.stringify({ success: false, error: 'Malformed model output', fallback: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message, fallback: true }));
          }
        });
      });

      server.middlewares.use('/api/generate', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            res.statusCode = 503;
            res.end(
              JSON.stringify({
                success: false,
                error: 'GEMINI_API_KEY not configured on server',
                fallback: true,
              })
            );
            return;
          }

          try {
            const { GoogleGenAI } = await import('@google/genai');
            const parsed = JSON.parse(body || '{}');
            const ai = new GoogleGenAI();

            const promptText = `
You are the advanced adaptive engineering intelligence for SCRAPSHIFT.
PURPOSE: SCRAPSHIFT turns discarded materials into practical solutions to real-world problems.
STRICT MANDATE: DO NOT GENERATE RANDOM CRAFTS (NO PENCIL HOLDERS, NO DECORATIVE JARS, NO TRINKETS).

UNDERSTAND THREE ESSENTIAL PILLARS:
1. WHAT MATERIALS ARE AVAILABLE?
Analyze the user's scrap materials (and uploaded photo if provided) to identify usable materials, quantities, structural properties, and physical limitations.
If the user provides VR equipment, lenses, electronics, sensors, tools, metal scrap, or specialized gear, design inventions that specifically harness those exact optical, electronic, mechanical, or structural assets.

2. WHAT CAN THOSE MATERIALS SOLVE?
Generate practical, creative inventions based on the materials, the user's actual needs, available tools, and real-world feasibility. Every suggestion must have a clear purpose, solving genuine friction or utility needs.

3. WHAT DID PREVIOUS ATTEMPTS TEACH US? (CONTINUAL LEARNING)
Review the recorded past failure lessons below. If previous builds experienced bending, cracking, over-saturation, adhesive detachment, or poor ergonomics, adapt the new recommendations specifically to overcome those flaws. Explain the adaptation in "sourceLessonsApplied".

USER SCRAP INVENTORY:
${JSON.stringify(parsed.materials || [], null, 2)}

INTENDED GOAL / NEED:
${parsed.goal || 'practical utility'} (${parsed.customGoal || 'No custom goal specified'})

USER WORKBENCH CONSTRAINTS:
Budget Tier: ${parsed.constraints?.budget || 'zero_cost'}
Available Tools: ${(parsed.constraints?.availableTools || []).join(', ')}
Preferred Difficulty: ${parsed.constraints?.difficulty || 'beginner'}
Intended Use: ${parsed.constraints?.intendedUse || 'workshop or household'}

PREVIOUS RECORDED FAILURE LESSONS & DIRECTIVES:
${JSON.stringify(parsed.matchedLessons || [], null, 2)}
Directives: ${(parsed.designDirectives || []).join('; ')}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON matching this schema:
{
  "concepts": [
    {
      "id": "string",
      "name": "string (practical, distinctive invention title)",
      "tagline": "string (concise summary of mechanism and purpose)",
      "problemSolved": "string (concrete practical problem addressed)",
      "intendedUse": "string",
      "whyMaterialsSuitable": "string (explaining the mechanical/optical/physical reasoning)",
      "materialsHave": [{ "name": "string", "quantity": "string", "role": "string" }],
      "materialsNeed": [{ "name": "string", "estimatedCost": "string", "whereToFind": "string" }],
      "toolsRequired": ["string"],
      "difficulty": "beginner" | "moderate" | "ambitious",
      "estimatedTimeMinutes": number,
      "estimatedCostRange": "string",
      "costAssumptions": "string",
      "limitations": ["string"],
      "safetyConsiderations": ["string"],
      "steps": [
        {
          "stepNumber": number,
          "title": "string",
          "instruction": "string",
          "safetyTip": "string (optional)"
        }
      ],
      "sourceLessonsApplied": [
        {
          "lessonId": "string",
          "originalProblem": "string",
          "whatChanged": "string",
          "reason": "string"
        }
      ],
      "version": 1,
      "createdAt": "${new Date().toISOString().split('T')[0]}"
    }
  ]
}
Generate exactly 3 diverse, feasible, high-utility concepts.
`;

            const contents: any[] = [];
            if (parsed.photoBase64) {
              const cleanBase64 = parsed.photoBase64.replace(/^data:image\/\w+;base64,/, '');
              contents.push({
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: cleanBase64,
                      mimeType: parsed.photoMimeType || 'image/jpeg',
                    },
                  },
                  { text: promptText },
                ],
              });
            } else {
              contents.push({
                role: 'user',
                parts: [{ text: promptText }],
              });
            }

            const response = await ai.models.generateContent({
              model: 'gemini-3.5-flash-lite',
              contents,
              config: { responseMimeType: 'application/json' },
            });

            const text = response.text || '';
            const data = JSON.parse(text);

            if (data.concepts && Array.isArray(data.concepts) && data.concepts.length > 0) {
              res.end(JSON.stringify({ success: true, concepts: data.concepts, source: 'gemini' }));
              return;
            }

            res.statusCode = 422;
            res.end(JSON.stringify({ success: false, error: 'Malformed output', fallback: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message, fallback: true }));
          }
        });
      });

    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

