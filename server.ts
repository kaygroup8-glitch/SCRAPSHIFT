/**
 * SCRAPSHIFT Full-Stack Server
 * Express entry point hosting the frontend via Vite dev middleware in development
 * and providing secure, server-side Gemini API endpoints without exposing keys to clients.
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Image analysis endpoint for salvage materials photo
app.post('/api/analyze-image', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      success: false,
      error: 'GEMINI_API_KEY not configured on server. Please use manual entry.',
      fallback: true,
    });
    return;
  }

  try {
    const { imageBase64, mimeType } = req.body;
    const base64Data = (imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');

    if (!base64Data) {
      res.status(400).json({ success: false, error: 'No image data provided' });
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
                mimeType: mimeType || 'image/jpeg',
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
      res.json({ success: true, materials: data.detectedMaterials, summary: data.summary || '' });
      return;
    }

    res.status(422).json({ success: false, error: 'Malformed model output', fallback: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, fallback: true });
  }
});


// Server-side Gemini generation endpoint
app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      success: false,
      error: 'GEMINI_API_KEY not configured on server',
      fallback: true,
    });
    return;
  }

  try {
    const { materials, goal, customGoal, constraints, matchedLessons, designDirectives, photoBase64, photoMimeType } = req.body;

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
${JSON.stringify(materials || [], null, 2)}

INTENDED GOAL / NEED:
${goal || 'practical utility'} (${customGoal || 'No custom goal specified'})

USER WORKBENCH CONSTRAINTS:
Budget Tier: ${constraints?.budget || 'zero_cost'}
Available Tools: ${(constraints?.availableTools || []).join(', ')}
Preferred Difficulty: ${constraints?.difficulty || 'beginner'}
Intended Use: ${constraints?.intendedUse || 'workshop or household'}

PREVIOUS RECORDED FAILURE LESSONS & DIRECTIVES:
${JSON.stringify(matchedLessons || [], null, 2)}
Directives: ${(designDirectives || []).join('; ')}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON with a "concepts" array of 3 distinct objects matching the schema.
`;

    const contents: any[] = [];
    if (photoBase64) {
      const cleanBase64 = photoBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: photoMimeType || 'image/jpeg',
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
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    if (parsed.concepts && Array.isArray(parsed.concepts) && parsed.concepts.length > 0) {
      res.json({
        success: true,
        concepts: parsed.concepts,
        source: 'gemini',
      });
      return;
    }


    res.status(422).json({
      success: false,
      error: 'Malformed model response',
      fallback: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Generation failed',
      fallback: true,
    });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SCRAPSHIFT server listening on http://0.0.0.0:${PORT}`);
  });
}

// Only start when executed directly
if (process.env.NODE_ENV === 'production' || process.argv[1] === __filename) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
