/**
 * Invention Generation Engine for SCRAPSHIFT
 * Generates three distinct, grounded, practical concepts based on user materials, constraints,
 * and historical lessons retrieved from the user's persistent learning journal.
 */

import {
  GenerationInput,
  InventionConcept,
  InventionConstraint,
  MaterialItem,
  LessonChangeNote,
} from '../types';
import { LessonMatcher } from './lessonMatcher';
import { StorageService } from './storage';

// Curated high-fidelity assets from our verified generation
const CONCEPT_IMAGE_MAP: Record<string, string> = {
  cardboard_organizer: '/src/assets/images/concept_cardboard_organizer_1792255110536.jpg',
  reclaimed_planter: '/src/assets/images/concept_reclaimed_planter_1792255110783.jpg',
  packaging_storage: '/src/assets/images/concept_packaging_storage_1792255110822.jpg',
  hero_default: '/src/assets/images/hero_scrapshift_transformation_1792255109387.jpg',
};

export const InventionEngine = {
  /**
   * Main generation function: retrieves relevant lessons first, then attempts
   * server-side Gemini generation if consented and configured, otherwise executing
   * deterministic scrap-engineering synthesis.
   */
  async generateConcepts(input: GenerationInput): Promise<{
    concepts: InventionConcept[];
    sourceLessons: LessonChangeNote[];
    engineSource: 'gemini' | 'deterministic';
    learningNotes: string;
  }> {
    // Stage A: Retrieve relevant past lessons
    const { matchedLessons, designDirectives, changeNotes, summaryExplanation } =
      LessonMatcher.findRelevantLessons(input.materials, input.goal, input.constraints);

    // Stage B: Direct server Gemini API call
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: input.materials,
          goal: input.goal,
          customGoal: input.customGoal,
          constraints: input.constraints,
          matchedLessons,
          designDirectives,
          photoBase64: input.photoBase64,
          photoMimeType: input.photoMimeType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.concepts && Array.isArray(data.concepts) && data.concepts.length > 0) {
          return {
            concepts: data.concepts,
            sourceLessons: changeNotes,
            engineSource: 'gemini',
            learningNotes: summaryExplanation,
          };
        }
      }
    } catch {
      // API offline or not configured; seamlessly fall through to deterministic engine
    }


    // Stage C: Deterministic concept synthesis (guaranteed working with full lesson integration)
    const concepts = this.synthesizeDeterministic(
      input.materials,
      input.goal,
      input.customGoal,
      input.constraints,
      changeNotes,
      designDirectives
    );

    return {
      concepts,
      sourceLessons: changeNotes,
      engineSource: 'deterministic',
      learningNotes: summaryExplanation,
    };
  },

  /**
   * Deterministic engine that creates 3 distinct, practical invention concepts
   * based on specific material properties and explicitly applies previous lessons.
   */
  synthesizeDeterministic(
    materials: MaterialItem[],
    goal: string,
    customGoal: string | undefined,
    constraints: InventionConstraint,
    changeNotes: LessonChangeNote[],
    designDirectives: string[]
  ): InventionConcept[] {
    const timestamp = new Date().toISOString().split('T')[0];
    const materialNames = materials.map((m) => m.name.toLowerCase());
    const allText = (
      materialNames.join(' ') +
      ' ' +
      goal +
      ' ' +
      (customGoal || '') +
      ' ' +
      (constraints.intendedUse || '')
    ).toLowerCase();

    const isVRorOptics =
      allText.includes('vr') ||
      allText.includes('virtual reality') ||
      allText.includes('headset') ||
      allText.includes('lens') ||
      allText.includes('goggle') ||
      allText.includes('oculus') ||
      allText.includes('optics') ||
      allText.includes('stereoscopic');

    const hasCardboard = materialNames.some((m) => m.includes('cardboard') || m.includes('box'));
    const hasGlass = materialNames.some((m) => m.includes('glass') || m.includes('jar') || m.includes('bottle'));
    const hasPlastic = materialNames.some((m) => m.includes('plastic') || m.includes('bottle') || m.includes('tub'));
    const hasWood = materialNames.some((m) => m.includes('wood') || m.includes('dowel') || m.includes('skewer'));

    // Check if a cardboard bending lesson exists in changeNotes
    const hasCardboardBendingLesson = changeNotes.some(
      (n) => n.originalProblem.toLowerCase().includes('bent') || n.whatChanged.toLowerCase().includes('corrugation')
    );

    // If VR equipment or optics are detected in user materials or purpose
    if (isVRorOptics) {
      const concept1: InventionConcept = {
        id: `concept_${Date.now()}_vr1`,
        name: 'Stereoscopic Smartphone VR Viewer Chassis',
        tagline: 'Google Cardboard geometry adapted for reclaimed optics and smartphone displays.',
        problemSolved: 'Transforms a standard smartphone into an immersive 3D/VR spatial viewer using salvaged biconvex lenses and rigid housing.',
        intendedUse: constraints.intendedUse || 'Desktop immersion, 360-degree video, and 3D spatial viewing',
        whyMaterialsSuitable:
          'Biconvex lenses create the necessary optical focal length (~40-45mm) to project split-screen phone imagery across binocular vision, while salvaged housing provides a light-tight chamber.',
        materialsHave: materials.map((m) => ({
          name: m.name,
          quantity: m.quantity || '1 unit',
          role: m.name.toLowerCase().includes('lens')
            ? 'Optical magnification and binocular focus'
            : 'Light-tight enclosure and phone mounting chassis',
        })),
        materialsNeed: [
          {
            name: 'Scrap foam or weatherstripping',
            estimatedCost: 'Assuming $0 to $1 for household scrap',
            whereToFind: 'Draft blocker strips or packaging foam',
          },
          {
            name: 'Elastic band or hook-and-loop strip',
            estimatedCost: 'Assuming $0 to $1 for reclaimed clothing elastic',
            whereToFind: 'Old waistband or luggage strap',
          },
        ],
        toolsRequired: constraints.availableTools.length > 0 ? constraints.availableTools : ['Scissors', 'Ruler', 'Pencil'],
        difficulty: 'moderate',
        estimatedTimeMinutes: 45,
        estimatedCostRange: '$0 to $2',
        costAssumptions: 'Reuses salvaged lenses and chassis; minimal adhesive needed.',
        limitations: [
          'Interpupillary distance (IPD) must be measured manually to match user eye spacing.',
          'Not compatible with tablets; designed for 5.0 to 6.7 inch smartphones.',
        ],
        safetyConsiderations: [
          'Ensure lenses are securely anchored so they cannot dislodge toward eyes.',
          'Take regular breaks every 15 minutes to prevent visual strain.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Measure Interpupillary Distance (IPD)',
            instruction: 'Use a ruler in a mirror to measure the distance between your pupils (typically 62mm to 66mm). Mark the two optical centers on your lens plate.',
          },
          {
            stepNumber: 2,
            title: 'Seat and Lock Biconvex Lenses',
            instruction: 'Insert the lenses into the ocular brackets with curved faces facing outward toward the screen side. Secure edges with friction tabs or tape ring.',
          },
          {
            stepNumber: 3,
            title: 'Install Central Optical Divider',
            instruction: 'Mount a 10cm vertical septum divider down the center to ensure each eye only sees its corresponding left/right stereoscopic half.',
          },
          {
            stepNumber: 4,
            title: 'Fabricate Phone Retention Gate',
            instruction: 'Assemble a fold-down front retaining flap with a bottom ledge to grip your phone securely at the exact focal distance (~42mm from lens plane).',
          },
        ],
        conceptImageKey: 'cardboard_organizer',
        sourceLessonsApplied: changeNotes,
        version: 1,
        createdAt: timestamp,
      };

      const concept2: InventionConcept = {
        id: `concept_${Date.now()}_vr2`,
        name: 'Weighted VR Headset Desktop Cradle & Anti-Sunlight Shield',
        tagline: 'Protects delicate internal display panels from catastrophic lens sunlight burns.',
        problemSolved: 'Direct window light focused through VR lenses will permanently burn internal OLED screens within seconds; also solves tangled cable clutter.',
        intendedUse: constraints.intendedUse || 'Desk or shelf storage next to gaming PC or charging station',
        whyMaterialsSuitable:
          'Rigid salvage cardboard or wood structures block all ambient daylight from entering the ocular chamber, while soft foam scraps cradle the facial interface.',
        materialsHave: materials.map((m) => ({
          name: m.name,
          quantity: m.quantity || '1 unit',
          role: 'Protective dock body and lens cap shield',
        })),
        materialsNeed: [
          {
            name: 'Dense packaging cardboard or wood scraps',
            estimatedCost: 'Assuming $0 for scrap',
            whereToFind: 'Delivery boxes or workshop offcuts',
          },
        ],
        toolsRequired: ['Utility knife or scissors', 'Ruler', 'PVA glue'],
        difficulty: 'beginner',
        estimatedTimeMinutes: 30,
        estimatedCostRange: '$0',
        costAssumptions: 'Built 100% from salvaged packing materials.',
        limitations: [
          'Must be sized specifically to your headset model.',
        ],
        safetyConsiderations: [
          'Ensure cradle is heavily weighted at the base so headset cannot tip forward.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Trace Facial Interface Contour',
            instruction: 'Place headset face-down on cardboard and trace the eye cup rim to create a perfectly fitted light-blocking lens cover plate.',
          },
          {
            stepNumber: 2,
            title: 'Build Angled Desktop Pedestal',
            instruction: 'Cut two triangular side brackets with a 45-degree slope to suspend the headset with lenses facing downward away from ceiling lights.',
          },
          {
            stepNumber: 3,
            title: 'Incorporate Controller Hanging Pegs',
            instruction: 'Notch two 3cm side arms to hold left and right motion controllers by their tracking rings.',
          },
        ],
        conceptImageKey: 'packaging_storage',
        sourceLessonsApplied: [],
        version: 1,
        createdAt: timestamp,
      };

      const concept3: InventionConcept = {
        id: `concept_${Date.now()}_vr3`,
        name: 'Ergonomic Counterweight Strap & Cable Tether Rig',
        tagline: 'Balances front-heavy headset mass and routes tether cables overhead.',
        problemSolved: 'Heavy front visor pulling down on cheekbones and neck fatigue during gaming sessions.',
        intendedUse: constraints.intendedUse || 'Room-scale VR playing area',
        whyMaterialsSuitable:
          'Reclaims elastic scraps, fabric belts, and small weights to distribute the headset gravitational center directly over the cervical spine.',
        materialsHave: materials.map((m) => ({
          name: m.name,
          quantity: m.quantity || '1 unit',
          role: 'Strap anchors and cable guide cleats',
        })),
        materialsNeed: [
          {
            name: 'Small counterweight (washers, battery pack, or coins ~200g)',
            estimatedCost: 'Assuming $0 for household odds and ends',
            whereToFind: 'Junk drawer or toolbox',
          },
        ],
        toolsRequired: ['Scissors', 'Pliers', 'Tape'],
        difficulty: 'beginner',
        estimatedTimeMinutes: 25,
        estimatedCostRange: '$0',
        costAssumptions: 'Uses discarded strap remnants and household fasteners.',
        limitations: [
          'Do not overload beyond the weight of the front visor (typically 200g to 300g).',
        ],
        safetyConsiderations: [
          'Anchor counterweight firmly with double-wrapped tape so it cannot dislodge during rapid head rotation.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Weigh Rear Counterbalance',
            instruction: 'Assemble a compact 200g pouch using scrap fabric or tape containing metal washers or dead batteries.',
          },
          {
            stepNumber: 2,
            title: 'Fasten to Rear Strap Loop',
            instruction: 'Secure the pouch symmetrically to the lower rear cradle of the head strap using Velcro or zip ties.',
          },
          {
            stepNumber: 3,
            title: 'Attach Overhead Cable Cleat',
            instruction: 'Fabricate a smooth sliding ring from wire hanger scrap to guide the main headset cable along the top head strap toward your back.',
          },
        ],
        conceptImageKey: 'hero_default',
        sourceLessonsApplied: [],
        version: 1,
        createdAt: timestamp,
      };

      return [concept1, concept2, concept3];
    }

    // Concept 1: Primary focused solution (Cardboard / Household / Standard)
    let concept1: InventionConcept;
    if (goal === 'organize_desk' || goal === 'study_area' || hasCardboardBendingLesson) {
      const isReinforced = hasCardboardBendingLesson || designDirectives.length > 0;
      concept1 = {
        id: `concept_${Date.now()}_1`,
        name: isReinforced
          ? 'Tri-Truss Interlocking Phone and Tool Station'
          : 'Slotted Modular Desktop Organizer',
        tagline: isReinforced
          ? 'Upgraded with vertical flute alignment and diagonal shear braces.'
          : 'Tab-and-slot joinery that keeps desk essentials off table surfaces.',
        problemSolved: isReinforced
          ? 'Prevents structural cardboard sag under heavier smartphones while keeping pens, cords, and cards visible.'
          : 'Tangles of charging cables, loose writing implements, and scattered notes cluttering a small workstation.',
        intendedUse: constraints.intendedUse || 'Compact desktop workspace or study table',
        whyMaterialsSuitable:
          'Corrugated cardboard provides high stiffness-to-weight ratio when the fluting runs perpendicular to the load axis. Natural flutes also form built-in wire routing channels.',
        materialsHave: materials.map((m) => ({
          name: m.name,
          quantity: m.quantity || '1 unit',
          role: m.category === 'cardboard' ? 'Structural chassis and dividers' : 'Securing tabs and weights',
        })),
        materialsNeed: [
          {
            name: 'PVA glue or masking tape',
            estimatedCost: 'Assuming $0 to $2 for household tape already on hand',
            whereToFind: 'Desk drawer or craft supply box',
          },
        ],
        toolsRequired: constraints.availableTools.length > 0 ? constraints.availableTools : ['Scissors', 'Ruler', 'Pencil'],
        difficulty: constraints.difficulty || 'beginner',
        estimatedTimeMinutes: isReinforced ? 35 : 25,
        estimatedCostRange: '$0 (zero new purchases)',
        costAssumptions: 'Relies completely on salvaged packaging; adhesive is assumed on hand in basic household supplies.',
        limitations: [
          'Not water resistant; keep away from mugs and spills.',
          'Load capacity is limited to handheld items under 1.5 pounds.',
          'Joint tabs can loosen if repeatedly disassembled.',
        ],
        safetyConsiderations: [
          'Score along a metal edge slowly to prevent utility knife slip.',
          'Never place near desk heating lamps, candles, or open flame.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: isReinforced ? 'Verify Flute Grain Orientation' : 'Layout Chassis Plate',
            instruction: isReinforced
              ? 'Inspect your cardboard sheet. Ensure the internal corrugated flutes run vertically (top to bottom) on the backrest. This prevents horizontal buckling under phone weight.'
              : 'Measure a 20cm x 15cm rectangle on your flat cardboard piece using a ruler and pencil.',
            safetyTip: 'Use a clean cutting mat or scrap wood underneath.',
          },
          {
            stepNumber: 2,
            title: isReinforced ? 'Cut Dual Triangular Gusset Wedges' : 'Score and Fold Dividing Lips',
            instruction: isReinforced
              ? 'Cut two identical 60-degree right triangles from double-wall cardboard. These form side trusses that lock the rear cradle at a fixed 70-degree viewing tilt.'
              : 'Lightly score along fold lines at 5cm intervals without cutting through the bottom paper liner.',
            safetyTip: 'Apply light, repeated passes rather than heavy blade pressure.',
          },
          {
            stepNumber: 3,
            title: 'Cut Interlocking Interlocking Notches',
            instruction: 'Cut 3mm wide slots into the base plate that match the thickness of your divider ribs. Friction-fit them into place.',
          },
          {
            stepNumber: 4,
            title: 'Reinforce Lower Cradle Shelf',
            instruction: 'Fold a 2cm front retaining lip forward and apply a bead of glue along the internal seam to prevent forward device slip.',
          },
        ],
        conceptImageKey: 'cardboard_organizer',
        sourceLessonsApplied: isReinforced ? changeNotes : [],
        version: 1,
        createdAt: timestamp,
      };
    } else {
      concept1 = {
        id: `concept_${Date.now()}_1`,
        name: 'Inverted Glass Reservoir Self-Watering Planter',
        tagline: 'Controlled sub-irrigation for kitchen herbs using reclaimed containers.',
        problemSolved: 'Over-watering or forgetting to water sensitive potted plants on indoor windowsills.',
        intendedUse: constraints.intendedUse || 'Kitchen or living room windowsill',
        whyMaterialsSuitable: 'Glass provides inert, watertight reservoir containment and visibility of water levels without chemical leaching.',
        materialsHave: materials.map((m) => ({
          name: m.name,
          quantity: m.quantity || '1 unit',
          role: 'Water reservoir and planter funnel',
        })),
        materialsNeed: [
          {
            name: 'Natural cotton twine or braided strip',
            estimatedCost: 'Assuming $0 to $1 for reclaimed twine',
            whereToFind: 'Packaging twine or 100% cotton cloth strip',
          },
          {
            name: 'Potting soil and seeds',
            estimatedCost: 'Assuming $2 to $4 if not on hand',
            whereToFind: 'Garden center or outdoor garden bed',
          },
        ],
        toolsRequired: ['Utility knife or glass score tool', 'Sandpaper', 'Pliers'],
        difficulty: 'moderate',
        estimatedTimeMinutes: 40,
        estimatedCostRange: '$0 to $3',
        costAssumptions: 'Bottle is reclaimed waste; wick is salvaged cotton material.',
        limitations: [
          'Glass cut rims must be thoroughly abraded to avoid sharp touch hazards.',
          'Not suited for large root vegetables; optimal for basil, mint, or succulents.',
        ],
        safetyConsiderations: [
          'Wear eye protection and work gloves when scoring or separating glass.',
          'Wet-sand all raw glass rims using 120-grit wet/dry paper before assembly.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Clean and Remove Adhesives',
            instruction: 'Soak glass container in warm soapy water for 15 minutes to strip paper labeling and glue residue.',
          },
          {
            stepNumber: 2,
            title: 'Thread Capillary Wick',
            instruction: 'Thread a single 15cm cotton cord through the neck opening. Knot once inside the inverted funnel to prevent the wick from sliding through.',
          },
          {
            stepNumber: 3,
            title: 'Nest Funnel into Base',
            instruction: 'Invert the upper cone into the lower jar cylinder so the cotton tail submerges 3cm into the water pool.',
          },
          {
            stepNumber: 4,
            title: 'Add Soil and Planting',
            instruction: 'Fill with loose potting mix around the central wick, plant seed or seedling, and water once from the top to start capillary attraction.',
          },
        ],
        conceptImageKey: 'reclaimed_planter',
        sourceLessonsApplied: changeNotes,
        version: 1,
        createdAt: timestamp,
      };
    }


    // Concept 2: Tiered packaging organizer / multi-drawer unit
    const concept2: InventionConcept = {
      id: `concept_${Date.now()}_2`,
      name: 'Nested Corrugated Slide Tray Caddy',
      tagline: 'Friction-free modular parts caddy with low-abrasion guide rails.',
      problemSolved: 'Scattered screws, craft hardware, and small electronic parts without needing plastic organizer bins.',
      intendedUse: constraints.intendedUse || 'Workbench or craft area',
      whyMaterialsSuitable: 'Salvaged packaging boxes offer uniform wall thickness and square angles that nest into reliable drawer sleeves.',
      materialsHave: materials.map((m) => ({
        name: m.name,
        quantity: m.quantity || '1 unit',
        role: 'Tray box sleeves and internal dividers',
      })),
      materialsNeed: [
        {
          name: 'Clear packing tape or wax candle',
          estimatedCost: 'Assuming $0 to $1 for household scrap tape',
          whereToFind: 'Household stationery drawer',
        },
      ],
      toolsRequired: ['Utility knife or scissors', 'Ruler', 'Pencil'],
      difficulty: 'moderate',
      estimatedTimeMinutes: 45,
      estimatedCostRange: '$0 (salvaged materials)',
      costAssumptions: 'Uses discarded delivery boxes and scrap cardboard tabs.',
      limitations: [
        'Weight capacity limited to 2 pounds per drawer.',
        'Requires dry indoor environment to prevent paper fiber softening.',
      ],
      safetyConsiderations: [
        'Keep finger tips clear of cutting line when slicing multi-wall corrugation.',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Trim Equal Drawer Sleeves',
          instruction: 'Cut two matching outer sleeve housings with open front faces from uniform packaging boxes.',
        },
        {
          stepNumber: 2,
          title: 'Apply Friction Reduction',
          instruction: 'Line the bottom slide surfaces with a single layer of slick packaging tape to stop paper-on-paper binding.',
        },
        {
          stepNumber: 3,
          title: 'Fold Internal Tray Bins',
          instruction: 'Fold 4cm shallow inner trays with 1mm clearance on each side for smooth drawer travel.',
        },
        {
          stepNumber: 4,
          title: 'Attach Reclaimed Pull Tabs',
          instruction: 'Fold small scrap cardboard loops through front slot perforations to serve as pull handles.',
        },
      ],
      conceptImageKey: 'packaging_storage',
      sourceLessonsApplied: changeNotes.filter((n) => n.originalProblem.toLowerCase().includes('friction') || n.whatChanged.toLowerCase().includes('tape')),
      version: 1,
      createdAt: timestamp,
    };

    // Concept 3: Compact utility bracket / hanger / hanging organizer
    const concept3: InventionConcept = {
      id: `concept_${Date.now()}_3`,
      name: 'Interlocking Wall-Hang Cable and Tool Bracket',
      tagline: 'Minimalist hanging cleat made entirely from layered scrap cardboard.',
      problemSolved: 'Coiled cords, headphones, or light tools left sprawling over working surfaces.',
      intendedUse: constraints.intendedUse || 'Wall, shelf edge, or side of desk',
      whyMaterialsSuitable: 'Laminating three layers of corrugated board with alternating flute angles yields plywood-like dimensional rigidity.',
      materialsHave: materials.map((m) => ({
        name: m.name,
        quantity: m.quantity || '1 unit',
        role: 'Laminated hook plates',
      })),
      materialsNeed: [
        {
          name: 'Adhesive or push pins',
          estimatedCost: 'Assuming $0 for scrap household adhesive',
          whereToFind: 'Kitchen junk drawer',
        },
      ],
      toolsRequired: ['Scissors or craft knife', 'Ruler'],
      difficulty: 'beginner',
      estimatedTimeMinutes: 20,
      estimatedCostRange: '$0',
      costAssumptions: 'No bought supplies; uses leftover craft scraps.',
      limitations: [
        'Designed for loads under 3 pounds.',
        'Do not hang wet or sharp tools directly on uncoated cardboard edges.',
      ],
      safetyConsiderations: [
        'Ensure wall anchor or double-sided tape is firmly secured before loading weight.',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Cross-Grain Lamination',
          instruction: 'Cut 3 identical hook profiles. Rotate the middle layer 90 degrees so its internal corrugation runs perpendicular to the outer layers.',
        },
        {
          stepNumber: 2,
          title: 'Bond and Compress',
          instruction: 'Spread a thin film of glue between layers and clamp under a heavy book for 15 minutes.',
        },
        {
          stepNumber: 3,
          title: 'Mount and Load Test',
          instruction: 'Secure to desk leg or shelf with screw or heavy tape. Test gently with a 0.5 lb test weight before hanging sensitive items.',
        },
      ],
      conceptImageKey: 'hero_default',
      sourceLessonsApplied: [],
      version: 1,
      createdAt: timestamp,
    };

    return [concept1, concept2, concept3];
  },

  /**
   * Adapts an existing concept based on changed user constraints and new feedback.
   * Produces a versioned redesign (v2) linked to the original project.
   */
  adaptDesign(
    originalConcept: InventionConcept,
    newConstraints: Partial<InventionConstraint>,
    reasonForChange: string
  ): {
    adaptedConcept: InventionConcept;
    changeExplanation: {
      whatChanged: string;
      constraintCause: string;
      lessonInfluence: string;
    };
  } {
    const updatedConstraints: InventionConstraint = {
      budget: newConstraints.budget || 'zero_cost',
      availableTools: newConstraints.availableTools || originalConcept.toolsRequired,
      difficulty: newConstraints.difficulty || originalConcept.difficulty,
      intendedUse: newConstraints.intendedUse || originalConcept.intendedUse,
      notes: newConstraints.notes || '',
    };

    // Check relevant lessons again for this adapted category
    const relevantLessons = StorageService.getLessons().filter(
      (l) =>
        l.projectId === originalConcept.id ||
        originalConcept.name.toLowerCase().includes(l.category.toLowerCase()) ||
        originalConcept.materialsHave.some((m) => l.materialsUsed.some((lu) => lu.toLowerCase().includes(m.name.toLowerCase())))
    );

    const isSimpler = updatedConstraints.difficulty === 'beginner' && originalConcept.difficulty !== 'beginner';
    const isBudgetTighter = updatedConstraints.budget === 'zero_cost';
    const missingTools = originalConcept.toolsRequired.filter(
      (t) => !updatedConstraints.availableTools.map((at) => at.toLowerCase()).includes(t.toLowerCase())
    );

    let whatChanged = '';
    let constraintCause = '';
    let lessonInfluence = '';

    if (missingTools.length > 0) {
      whatChanged = `Replaced machine/complex tool operations with manual fold-and-slot joinery that requires only ${updatedConstraints.availableTools.join(', ')}.`;
      constraintCause = `Missing tools: ${missingTools.join(', ')}.`;
    } else if (isSimpler) {
      whatChanged = 'Reduced the component count from multi-part glued assembly to a single-sheet continuous scored folding pattern.';
      constraintCause = 'Difficulty reduced to beginner level.';
    } else {
      whatChanged = 'Reinforced primary structural load joints with dual-triangular gusset ribs and cross-grain cardboard lamination.';
      constraintCause = `Requested adjustment: ${reasonForChange || 'Structural improvement'}.`;
    }

    if (relevantLessons.length > 0) {
      const topLesson = relevantLessons[0];
      lessonInfluence = `Directly guided by lesson from "${topLesson.projectTitle}" where outcome was "${topLesson.outcome.replace('_', ' ')}": ${topLesson.suggestedDesignAdjustment}`;
    } else {
      lessonInfluence = 'No direct prior failure logged for this exact build; adjustment applied mechanical scrap principles.';
    }

    const adaptedConcept: InventionConcept = {
      ...originalConcept,
      id: `${originalConcept.id}_v${(originalConcept.version || 1) + 1}`,
      name: `${originalConcept.name.replace(/\s*\(v\d+\)/, '')} (v${(originalConcept.version || 1) + 1})`,
      tagline: `Adapted redesign: ${whatChanged}`,
      difficulty: updatedConstraints.difficulty,
      toolsRequired: updatedConstraints.availableTools.length > 0 ? updatedConstraints.availableTools : originalConcept.toolsRequired,
      version: (originalConcept.version || 1) + 1,
      parentProjectId: originalConcept.parentProjectId || originalConcept.id,
      sourceLessonsApplied: [
        ...originalConcept.sourceLessonsApplied,
        {
          lessonId: relevantLessons[0]?.id || 'manual_adaptation',
          originalProblem: reasonForChange || 'User requested redesign with updated constraints',
          whatChanged,
          reason: constraintCause,
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      steps: originalConcept.steps.map((st, idx) => {
        if (idx === 0) {
          return {
            ...st,
            title: `Redesigned: ${st.title}`,
            instruction: `${st.instruction} (Adjusted for: ${whatChanged})`,
          };
        }
        return st;
      }),
    };

    return {
      adaptedConcept,
      changeExplanation: {
        whatChanged,
        constraintCause,
        lessonInfluence,
      },
    };
  },
};
