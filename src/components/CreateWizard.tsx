/**
 * Create Wizard (/create) for SCRAPSHIFT
 * 4-stage guided onboarding experience:
 * Stage 1: Materials (photo reference, manual entry, edit/delete)
 * Stage 2: Purpose (standard & custom goals)
 * Stage 3: Constraints (budget, tools, difficulty, intended use)
 * Stage 4: Review (summary and generation trigger)
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { MaterialItem, InventionConstraint, ConstructionDifficulty, BudgetTier } from '../types';
import { StorageService } from '../services/storage';

interface CreateWizardProps {
  navigate: (path: string) => void;
  onGenerate: (
    materials: MaterialItem[],
    goal: string,
    customGoal: string,
    constraints: InventionConstraint,
    photoBase64?: string
  ) => void;
}


const COMMON_SCRAP_SUGGESTIONS = [
  { name: 'VR Headset Enclosure', category: 'plastic', quantity: '1 chassis housing' },
  { name: '42mm Biconvex Lenses', category: 'glass', quantity: '2 optical lenses' },
  { name: 'Elastic Head Strap', category: 'fabric', quantity: '1 3-point strap' },
  { name: 'Corrugated cardboard box', category: 'cardboard', quantity: '2 clean shipping boxes' },
  { name: 'Glass pasta sauce jar', category: 'glass', quantity: '1 jar with metal lid' },
  { name: 'PET plastic soda bottle (1L)', category: 'plastic', quantity: '2 clean bottles' },
  { name: 'Scrap wood offcut (pine)', category: 'wood', quantity: '1 piece ~30cm' },
  { name: 'Wire coat hanger', category: 'metal', quantity: '1 flexible hanger' },
  { name: 'Cotton fabric remnant', category: 'fabric', quantity: 'Scrap piece 20x30cm' },
];

const STANDARD_GOALS = [
  {
    id: 'organize_desk',
    title: 'Organizing a small space',
    description: 'Keep desktop essentials, cables, stationery, or books orderly without store-bought plastic containers.',
  },
  {
    id: 'grow_something',
    title: 'Growing something',
    description: 'Sub-irrigated planters, seedling trays, or herb pots using reclaimed bottles and containers.',
  },
  {
    id: 'store_objects',
    title: 'Storing objects',
    description: 'Modular hardware drawers, tool sorting bins, or craft supply separators from rigid packaging.',
  },
  {
    id: 'study_area',
    title: 'Improving a study area',
    description: 'Phone stand, reading easel, or notebook cradle for ergonomic study and video reference.',
  },
  {
    id: 'household_problem',
    title: 'Solving a household problem',
    description: 'Door stops, wall hang brackets, cable routing cleats, or shelf edge guards.',
  },
  {
    id: 'unusual_invention',
    title: 'Exploring unusual invention ideas',
    description: 'Creative kinetic linkages, experimental mechanical contraptions, and scrap art challenges.',
  },
];

const STANDARD_TOOLS = [
  'Scissors',
  'Utility knife / box cutter',
  'Ruler / measuring tape',
  'Pencil or marker',
  'PVA craft glue',
  'Hot glue gun',
  'Masking tape',
  'Clear packing tape',
  'Pliers',
  'Sandpaper',
  'Small hand saw',
];

export const CreateWizard: React.FC<CreateWizardProps> = ({ navigate, onGenerate }) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1 State: Materials
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [materialName, setMaterialName] = useState('');
  const [materialCategory, setMaterialCategory] = useState<MaterialItem['category']>('cardboard');
  const [materialQty, setMaterialQty] = useState('');
  const [materialCondition, setMaterialCondition] = useState<MaterialItem['condition']>('clean_scrap');
  const [materialNotes, setMaterialNotes] = useState('');
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);


  // Stage 2 State: Purpose
  const [selectedGoal, setSelectedGoal] = useState<string>('organize_desk');
  const [customGoalText, setCustomGoalText] = useState('');

  // Stage 3 State: Constraints
  const [budget, setBudget] = useState<BudgetTier>('zero_cost');
  const [availableTools, setAvailableTools] = useState<string[]>([
    'Scissors',
    'Ruler / measuring tape',
    'Pencil or marker',
    'Masking tape',
  ]);
  const [customToolInput, setCustomToolInput] = useState('');
  const [difficulty, setDifficulty] = useState<ConstructionDifficulty>('beginner');
  const [intendedUse, setIntendedUse] = useState('Home desk or tabletop surface');
  const [constraintNotes, setConstraintNotes] = useState('');

  // Consent
  const [aiConsent, setAiConsent] = useState(false);

  // Load drafts on mount
  useEffect(() => {
    const draftMats = StorageService.getDraftMaterials();
    if (draftMats.length > 0) {
      setMaterials(draftMats);
    } else {
      setMaterials([]);
    }


    const draftGoal = StorageService.getDraftGoal();
    if (draftGoal.goal) {
      setSelectedGoal(draftGoal.goal);
      setCustomGoalText(draftGoal.customGoal || '');
    }

    const draftConst = StorageService.getDraftConstraints();
    if (draftConst) {
      setBudget(draftConst.budget || 'zero_cost');
      setAvailableTools(draftConst.availableTools || ['Scissors', 'Ruler / measuring tape', 'Pencil or marker']);
      setDifficulty(draftConst.difficulty || 'beginner');
      setIntendedUse(draftConst.intendedUse || 'Home desk or tabletop surface');
    }

    setAiConsent(StorageService.hasAIConsent());
  }, []);

  // Sync draft changes
  const updateMaterialsList = (newMaterials: MaterialItem[]) => {
    setMaterials(newMaterials);
    StorageService.saveDraftMaterials(newMaterials);
  };

  const handleAddOrUpdateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    if (editingMaterialId) {
      const updated = materials.map((m) =>
        m.id === editingMaterialId
          ? {
              ...m,
              name: materialName.trim(),
              category: materialCategory,
              quantity: materialQty.trim() || '1 item',
              condition: materialCondition,
              notes: materialNotes.trim(),
            }
          : m
      );
      updateMaterialsList(updated);
      setEditingMaterialId(null);
    } else {
      const newItem: MaterialItem = {
        id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: materialName.trim(),
        category: materialCategory,
        quantity: materialQty.trim() || '1 item',
        condition: materialCondition,
        notes: materialNotes.trim(),
      };
      updateMaterialsList([...materials, newItem]);
    }

    // Reset inputs
    setMaterialName('');
    setMaterialQty('');
    setMaterialNotes('');
  };

  const handleEditClick = (item: MaterialItem) => {
    setEditingMaterialId(item.id);
    setMaterialName(item.name);
    setMaterialCategory(item.category);
    setMaterialQty(item.quantity);
    setMaterialCondition(item.condition);
    setMaterialNotes(item.notes || '');
  };

  const handleDeleteMaterial = (id: string) => {
    updateMaterialsList(materials.filter((m) => m.id !== id));
    if (editingMaterialId === id) {
      setEditingMaterialId(null);
      setMaterialName('');
    }
  };

  const handleAddQuickSuggestion = (s: typeof COMMON_SCRAP_SUGGESTIONS[0]) => {
    const newItem: MaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: s.name,
      category: s.category as MaterialItem['category'],
      quantity: s.quantity,
      condition: 'clean_scrap',
    };
    updateMaterialsList([...materials, newItem]);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setIsAnalyzingImage(true);
        setAnalysisFeedback(null);

        try {
          const res = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: dataUrl,
              mimeType: file.type || 'image/jpeg',
            }),
          });

          const data = await res.json();
          if (data.success && data.materials && data.materials.length > 0) {
            const detected: MaterialItem[] = data.materials.map((dm: any) => ({
              id: `mat_vision_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: dm.name,
              category: dm.category || 'other',
              quantity: dm.quantity || '1 unit',
              condition: dm.condition || 'clean_scrap',
              notes: dm.notes || '',
            }));

            // If pile only had the initial starter cardboard box, replace it with user's detected scrap
            if (
              materials.length === 1 &&
              materials[0].name.toLowerCase().includes('corrugated delivery box')
            ) {
              updateMaterialsList(detected);
            } else {
              updateMaterialsList([...materials, ...detected]);
            }

            setAnalysisFeedback(
              `Identified from photo via Gemini Vision: ${detected.map((d) => d.name).join(', ')}. Added to your pile.`
            );
          } else {
            setAnalysisFeedback(
              data.error ||
                'Automated photo analysis requires a configured server key. Please use manual entry below.'
            );
          }
        } catch {
          setAnalysisFeedback(
            'Photo analysis unavailable. Please add materials manually using the form below.'
          );
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const toggleTool = (tool: string) => {
    if (availableTools.includes(tool)) {
      setAvailableTools(availableTools.filter((t) => t !== tool));
    } else {
      setAvailableTools([...availableTools, tool]);
    }
  };

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (customToolInput.trim() && !availableTools.includes(customToolInput.trim())) {
      setAvailableTools([...availableTools, customToolInput.trim()]);
      setCustomToolInput('');
    }
  };

  const handleProceedToStage2 = () => {
    if (materials.length === 0) return;
    setStage(2);
  };

  const handleProceedToStage3 = () => {
    StorageService.saveDraftGoal(selectedGoal, customGoalText);
    setStage(3);
  };

  const handleProceedToStage4 = () => {
    StorageService.saveDraftConstraints({
      budget,
      availableTools,
      difficulty,
      intendedUse,
      notes: constraintNotes,
    });
    setStage(4);
  };

  const handleTriggerGeneration = () => {
    StorageService.setAIConsent(true);
    onGenerate(
      materials,
      selectedGoal,
      customGoalText,
      {
        budget,
        availableTools,
        difficulty,
        intendedUse,
        notes: constraintNotes,
      },
      imagePreview || undefined
    );
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Step Tracker */}
      <div className="mb-10 pb-6 border-b border-[#20211E]/10">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#20211E]/60 mb-3">
          <span>CREATION WORKFLOW</span>
          <span>STAGE 0{stage} OF 04</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Materials' },
            { num: 2, label: 'Purpose' },
            { num: 3, label: 'Constraints' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 transition-all ${
                  stage >= s.num ? 'bg-[#FF6B35]' : 'bg-[#E8E4DA]'
                }`}
              />
              <span
                className={`text-xs font-heading hidden sm:block ${
                  stage === s.num ? 'font-bold text-[#20211E]' : 'text-[#20211E]/50'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE 1: MATERIALS */}
      {stage === 1 && (
        <div className="space-y-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-2">
              Stage 1: Materials
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20211E] font-heading tracking-tight mb-3">
              What have you got to work with?
            </h1>
            <p className="text-sm sm:text-base text-[#20211E]/80">
              Catalog your salvage pile. Add exact boxes, bottles, remnants, or hardware. You can upload an image for personal reference, but all material properties are verified manually.
            </p>
          </div>

          {/* Image Upload Box with Gemini Vision Inspection */}
          <div className="p-5 border border-dashed border-[#20211E]/25 bg-[#F7F5EF] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#20211E] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#173D32]" />
                  Pile Photo & Material Identification
                </h3>
                <p className="text-xs text-[#20211E]/70 mt-1 max-w-xl">
                  Upload a photo of your scrap pile (e.g. VR headset, lenses, cardboard, broken electronics). If the Gemini Vision server is active, it detects materials automatically.
                </p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider font-heading text-[#20211E] bg-[#E8E4DA] hover:bg-[#D4CEBF] transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                {isAnalyzingImage ? 'Analyzing Photo...' : 'Upload Scrap Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={isAnalyzingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Analysis In-Progress State */}
            {isAnalyzingImage && (
              <div className="p-3 bg-[#173D32]/10 border border-[#173D32]/30 flex items-center gap-2.5 text-xs text-[#173D32]">
                <div className="w-3.5 h-3.5 border-2 border-[#173D32] border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="font-medium">
                  Inspecting photo with Gemini Vision to extract components and scrap materials...
                </span>
              </div>
            )}

            {/* Analysis Result Banner */}
            {analysisFeedback && (
              <div className="p-3 bg-white border border-[#20211E]/15 text-xs text-[#20211E]/80 flex items-start justify-between gap-2">
                <p className="leading-relaxed">{analysisFeedback}</p>
                <button
                  type="button"
                  onClick={() => setAnalysisFeedback(null)}
                  className="text-xs text-[#20211E]/50 hover:text-[#20211E]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {imagePreview && (
              <div className="relative aspect-video max-h-48 overflow-hidden border border-[#20211E]/15 bg-black/5 mt-3">
                <img
                  src={imagePreview}
                  alt="User uploaded salvage materials pile"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setAnalysisFeedback(null);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 bg-[#20211E] text-white text-xs font-mono"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Quick Suggestions Strip */}
          <div>
            <span className="text-xs font-mono uppercase text-[#20211E]/60 block mb-2">
              Common Salvage Quick Add:
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_SCRAP_SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleAddQuickSuggestion(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#E8E4DA] hover:bg-[#D4CEBF] text-[#20211E] transition-colors"
                >
                  <Plus className="w-3 h-3 text-[#FF6B35]" />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Material Entry Form */}
          <form
            onSubmit={handleAddOrUpdateMaterial}
            className="p-6 border border-[#20211E]/15 bg-white space-y-4"
          >
            <h3 className="text-sm font-bold font-heading text-[#20211E] uppercase tracking-wider">
              {editingMaterialId ? 'Edit Material Entry' : 'Add Material to Pile'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#20211E]/70 mb-1">
                  MATERIAL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon medium shipping box"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#20211E]/70 mb-1">
                  CATEGORY
                </label>
                <select
                  value={materialCategory}
                  onChange={(e) => setMaterialCategory(e.target.value as MaterialItem['category'])}
                  className="w-full px-3 py-2 text-sm border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="cardboard">Cardboard / Paperboard</option>
                  <option value="glass">Glass Containers</option>
                  <option value="plastic">Rigid or Film Plastic</option>
                  <option value="wood">Wood / Timber Offcuts</option>
                  <option value="metal">Metal Hardware / Cans / Wire</option>
                  <option value="fabric">Fabric / Textiles</option>
                  <option value="electronics">Broken Electronics / Cables</option>
                  <option value="other">Other Salvage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#20211E]/70 mb-1">
                  QUANTITY / SIZE
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 boxes (approx 30x20x15cm)"
                  value={materialQty}
                  onChange={(e) => setMaterialQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#20211E]/70 mb-1">
                  CONDITION
                </label>
                <select
                  value={materialCondition}
                  onChange={(e) => setMaterialCondition(e.target.value as MaterialItem['condition'])}
                  className="w-full px-3 py-2 text-sm border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="clean_scrap">Clean scrap (ready to cut)</option>
                  <option value="used_good">Used good (labels still on)</option>
                  <option value="damaged">Damaged / Creased (needs trim)</option>
                  <option value="raw_remnant">Raw remnant / irregular scrap</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {editingMaterialId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMaterialId(null);
                    setMaterialName('');
                  }}
                  className="text-xs text-[#20211E]/60 underline"
                >
                  Cancel Edit
                </button>
              ) : (
                <span className="text-xs text-[#20211E]/50">Enter at least one material to proceed</span>
              )}

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider font-heading text-white bg-[#173D32] hover:bg-[#215445] transition-colors"
              >
                {editingMaterialId ? 'Save Changes' : 'Add to Pile'}
              </button>
            </div>
          </form>

          {/* Current Materials List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-heading text-[#20211E] uppercase tracking-wider">
                Current Pile ({materials.length})
              </h3>
              {materials.length === 0 && (
                <span className="text-xs text-[#FF6B35]">Please add at least 1 material</span>
              )}
            </div>

            {materials.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#20211E]/20 text-[#20211E]/60 text-sm">
                No materials in the pile yet. Use the quick add buttons above or fill in the form.
              </div>
            ) : (
              <div className="divide-y divide-[#20211E]/10 border border-[#20211E]/15 bg-[#F7F5EF]">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E8E4DA]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#20211E] font-heading">{m.name}</span>
                        <span className="text-xs text-[#173D32] font-mono">[{m.category}]</span>
                      </div>
                      <div className="text-xs text-[#20211E]/70 mt-0.5">
                        Quantity: {m.quantity} · Condition: {m.condition.replace('_', ' ')}
                        {m.notes && ` · Notes: ${m.notes}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(m)}
                        className="p-1.5 text-[#20211E]/70 hover:text-[#20211E]"
                        title="Edit material"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="p-1.5 text-[#20211E]/70 hover:text-[#FF6B35]"
                        title="Remove material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stage 1 Actions */}
          <div className="pt-6 border-t border-[#20211E]/10 flex justify-end">
            <button
              onClick={handleProceedToStage2}
              disabled={materials.length === 0}
              className={`inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-wider font-bold font-heading ${
                materials.length > 0
                  ? 'bg-[#FF6B35] text-white hover:bg-[#E85A26]'
                  : 'bg-[#20211E]/20 text-[#20211E]/40 cursor-not-allowed'
              }`}
            >
              Continue to Purpose
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: PURPOSE */}
      {stage === 2 && (
        <div className="space-y-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-2">
              Stage 2: Purpose
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20211E] font-heading tracking-tight mb-3">
              What would you like to make possible?
            </h1>
            <p className="text-sm sm:text-base text-[#20211E]/80">
              Pick a practical challenge you want to address with your scrap pile, or specify your own custom goal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STANDARD_GOALS.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-5 text-left border transition-all ${
                    isSelected
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5 ring-1 ring-[#FF6B35]'
                      : 'border-[#20211E]/15 bg-white hover:border-[#20211E]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold font-heading text-[#20211E]">
                      {goal.title}
                    </h3>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-[#20211E]/30'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-[#20211E]/75 leading-relaxed">
                    {goal.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Goal Input */}
          <div className="p-5 border border-[#20211E]/15 bg-[#F7F5EF] space-y-2">
            <label className="block text-xs font-mono uppercase text-[#20211E]/70">
              Or describe a specific custom challenge:
            </label>
            <input
              type="text"
              placeholder="e.g. Magnetic spice rack or wall-mounted cable separator"
              value={customGoalText}
              onChange={(e) => setCustomGoalText(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#20211E]/30 bg-white text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
            />
            <p className="text-xs text-[#20211E]/60">
              If entered, this custom intention takes precedence in concept generation.
            </p>
          </div>

          {/* Stage 2 Actions */}
          <div className="pt-6 border-t border-[#20211E]/10 flex items-center justify-between">
            <button
              onClick={() => setStage(1)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold font-heading text-[#20211E] hover:text-[#FF6B35]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Materials
            </button>
            <button
              onClick={handleProceedToStage3}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26]"
            >
              Continue to Constraints
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: CONSTRAINTS */}
      {stage === 3 && (
        <div className="space-y-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-2">
              Stage 3: Constraints
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20211E] font-heading tracking-tight mb-3">
              Define your workshop reality.
            </h1>
            <p className="text-sm sm:text-base text-[#20211E]/80">
              SCRAPSHIFT designs around what you actually have. Skip any details you are unsure about.
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#173D32] font-bold">
              APPROXIMATE BUDGET FOR EXTRA ADHESIVES OR FASTENERS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'zero_cost', label: 'Zero Cost ($0)', desc: '100% salvaged materials only' },
                { id: 'under_5', label: 'Under $5', desc: 'Can buy tape, glue, or sandpaper' },
                { id: 'under_15', label: 'Under $15', desc: 'Can buy screws, brackets, seeds' },
                { id: 'any', label: 'Flexible', desc: 'Prioritize function over lowest cost' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudget(tier.id as BudgetTier)}
                  className={`p-3 text-left border transition-all ${
                    budget === tier.id
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5 ring-1 ring-[#FF6B35]'
                      : 'border-[#20211E]/15 bg-white hover:border-[#20211E]/40'
                  }`}
                >
                  <span className="text-xs font-bold font-heading text-[#20211E] block">
                    {tier.label}
                  </span>
                  <span className="text-[11px] text-[#20211E]/60 block mt-1">
                    {tier.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#173D32] font-bold">
              AVAILABLE TOOLS IN YOUR WORKSPACE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {STANDARD_TOOLS.map((tool) => {
                const checked = availableTools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-2 text-left text-xs border flex items-center justify-between transition-colors ${
                      checked
                        ? 'border-[#173D32] bg-[#173D32] text-white font-medium'
                        : 'border-[#20211E]/20 bg-white text-[#20211E] hover:border-[#20211E]/40'
                    }`}
                  >
                    <span>{tool}</span>
                    {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Tool */}
            <form onSubmit={handleAddCustomTool} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add other tool (e.g. electric drill, heat gun)"
                value={customToolInput}
                onChange={(e) => setCustomToolInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-[#20211E]/30 bg-white text-[#20211E]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold font-heading bg-[#E8E4DA] hover:bg-[#D4CEBF] text-[#20211E]"
              >
                Add Tool
              </button>
            </form>
          </div>

          {/* Difficulty & Intended Use */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#173D32] font-bold">
                PREFERRED DIFFICULTY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'moderate', 'ambitious'] as ConstructionDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-center text-xs font-heading capitalize border transition-all ${
                      difficulty === d
                        ? 'border-[#FF6B35] bg-[#FF6B35] text-white font-bold'
                        : 'border-[#20211E]/20 bg-white text-[#20211E] hover:border-[#20211E]/40'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#173D32] font-bold">
                INTENDED USE LOCATION
              </label>
              <input
                type="text"
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g. Small apartment desk, outdoor porch"
                className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-white text-[#20211E]"
              />
            </div>
          </div>

          {/* Stage 3 Actions */}
          <div className="pt-6 border-t border-[#20211E]/10 flex items-center justify-between">
            <button
              onClick={() => setStage(2)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold font-heading text-[#20211E] hover:text-[#FF6B35]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Purpose
            </button>
            <button
              onClick={handleProceedToStage4}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26]"
            >
              Review and Confirm
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: REVIEW */}
      {stage === 4 && (
        <div className="space-y-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-2">
              Stage 4: Review
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20211E] font-heading tracking-tight mb-3">
              Review your parameters.
            </h1>
            <p className="text-sm sm:text-base text-[#20211E]/80">
              Confirm your materials, selected challenge, and workshop constraints before finding practical inventions.
            </p>
          </div>

          {/* Review Card 1: Materials */}
          <div className="p-6 border border-[#20211E]/15 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#20211E]/10">
              <h3 className="text-sm font-bold font-heading text-[#173D32] uppercase tracking-wider">
                Materials in Pile ({materials.length})
              </h3>
              <button
                onClick={() => setStage(1)}
                className="text-xs font-mono text-[#FF6B35] hover:underline"
              >
                Edit Materials
              </button>
            </div>
            <ul className="space-y-1.5 text-xs text-[#20211E]">
              {materials.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-[#20211E]/60 font-mono">
                    {m.quantity} · {m.category}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Review Card 2: Purpose & Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 border border-[#20211E]/15 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#20211E]/10">
                <h3 className="text-sm font-bold font-heading text-[#173D32] uppercase tracking-wider">
                  Selected Purpose
                </h3>
                <button
                  onClick={() => setStage(2)}
                  className="text-xs font-mono text-[#FF6B35] hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-xs font-bold text-[#20211E]">
                {STANDARD_GOALS.find((g) => g.id === selectedGoal)?.title || selectedGoal}
              </p>
              {customGoalText && (
                <p className="text-xs text-[#20211E]/70">
                  Custom focus: "{customGoalText}"
                </p>
              )}
            </div>

            <div className="p-6 border border-[#20211E]/15 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#20211E]/10">
                <h3 className="text-sm font-bold font-heading text-[#173D32] uppercase tracking-wider">
                  Constraints Summary
                </h3>
                <button
                  onClick={() => setStage(3)}
                  className="text-xs font-mono text-[#FF6B35] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-1 text-xs text-[#20211E]/80">
                <p><strong>Budget tier:</strong> {budget.replace('_', ' ')}</p>
                <p><strong>Difficulty:</strong> {difficulty}</p>
                <p><strong>Location:</strong> {intendedUse}</p>
                <p><strong>Tools:</strong> {availableTools.slice(0, 4).join(', ')}{availableTools.length > 4 ? ` +${availableTools.length - 4} more` : ''}</p>
              </div>
            </div>
          </div>

          {/* AI Consent & Processing Transparency */}
          <div className="p-5 border border-[#173D32]/20 bg-[#173D32]/5 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#173D32] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#173D32] font-heading">
                  Invention Synthesis Transparency
                </h4>
                <p className="text-xs text-[#20211E]/80 leading-relaxed">
                  SCRAPSHIFT synthesizes concepts using your local inventory and past recorded lessons. If a server-side Gemini endpoint is active, your materials and constraints may be processed to generate blueprints. Deterministic offline fallback is always supported.
                </p>
                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiConsent}
                    onChange={(e) => setAiConsent(e.target.checked)}
                    className="w-4 h-4 text-[#173D32] rounded-none focus:ring-0"
                  />
                  <span className="text-xs font-medium text-[#20211E]">
                    Allow server-side Gemini synthesis when configured (optional)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Stage 4 Actions */}
          <div className="pt-6 border-t border-[#20211E]/10 flex items-center justify-between">
            <button
              onClick={() => setStage(3)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold font-heading text-[#20211E] hover:text-[#FF6B35]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Constraints
            </button>
            <button
              onClick={handleTriggerGeneration}
              className="inline-flex items-center gap-2 px-10 py-4 text-sm uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] shadow-sm"
            >
              Find my inventions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
