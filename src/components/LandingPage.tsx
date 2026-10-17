/**
 * Landing Page for SCRAPSHIFT
 * Editorial, content-rich homepage celebrating material reuse and continual learning loops.
 * Adheres to zero-pill discipline, bold Oddly-inspired typography, and zero em dashes.
 */

import React from 'react';
import {
  ArrowRight,
  PackageOpen,
  Sparkles,
  Wrench,
  RotateCcw,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
  onOpenDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, onOpenDemo }) => {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#20211E]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Bold Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block">
                Utility Through Salvage
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#20211E] font-heading leading-[1.05]">
                Your next idea might be in the pile.
              </h1>
              <p className="text-lg sm:text-xl text-[#20211E]/80 leading-relaxed max-w-2xl">
                That empty bottle, leftover cardboard, or broken object may still have a useful form waiting inside it. SCRAPSHIFT helps you find it, build it, and make the next version better.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/create')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm uppercase tracking-wider font-bold text-white bg-[#FF6B35] hover:bg-[#E85A26] active:translate-y-px transition-all font-heading shadow-sm"
                >
                  Start with my materials
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm uppercase tracking-wider font-bold text-[#20211E] bg-[#E8E4DA] hover:bg-[#D4CEBF] transition-all font-heading"
                >
                  See how it works
                </button>
              </div>

              {/* Quick Trust and Demo Trigger */}
              <div className="pt-6 border-t border-[#20211E]/10 flex flex-wrap items-center gap-6 text-xs text-[#20211E]/70">
                <button
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-2 text-[#FF6B35] font-semibold hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Try the 7-step phone stand learning demo
                </button>
                <span>No account required</span>
                <span>Works offline or with Gemini</span>
              </div>
            </div>

            {/* Right Column: Verified High-Contrast Photographic Asset */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#20211E]/15 bg-[#E8E4DA]/50 p-2 shadow-sm">
                <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-[#20211E]">
                  <img
                    src="/src/assets/images/hero_scrapshift_transformation_1792255109387.jpg"
                    alt="Discarded workshop scrap materials beside a precision cardboard desk organizer and phone station"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1 bg-[#F7F5EF] border-t border-[#20211E]/10">
                  <div className="flex items-center justify-between text-xs font-heading font-bold text-[#173D32]">
                    <span>MATERIALS TO INVENTION</span>
                    <span>STUDIO RECORD #01</span>
                  </div>
                  <p className="text-xs text-[#20211E]/70 leading-snug">
                    Corrugated sheet offcuts, reclaimed glass jars, and brass wire turned into a modular desktop phone station and tool caddy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section className="py-20 md:py-28 bg-[#E8E4DA]/30 border-b border-[#20211E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-3">
              01. The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#20211E] font-heading leading-tight mb-6">
              Buying new is not the only place to start.
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-[#20211E]/80 leading-relaxed">
              <p>
                Garages, offices, and cupboards fill up with sturdy cardboard packaging, thick glass jars, and durable metal hardware. Most of it ends up in waste streams or collecting dust simply because people lack practical design blueprints, realistic joining techniques, or workshop equipment.
              </p>
              <p>
                Commercial consumer products often solve basic household friction with cheap, single-use plastic. With the right assembly method and mechanical awareness, materials you already own can serve the exact same purpose at zero monetary cost.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            <div className="p-6 border border-[#20211E]/10 bg-[#F7F5EF]">
              <span className="text-xs font-mono font-bold text-[#FF6B35] block mb-2">01 / CONSTRAINT</span>
              <h3 className="text-lg font-bold font-heading text-[#20211E] mb-2">Useful Materials, Unknown Forms</h3>
              <p className="text-sm text-[#20211E]/75 leading-relaxed">
                Sturdy boxes and containers have high structural potential, but without clear cutting patterns they look like trash.
              </p>
            </div>
            <div className="p-6 border border-[#20211E]/10 bg-[#F7F5EF]">
              <span className="text-xs font-mono font-bold text-[#FF6B35] block mb-2">02 / BARRIER</span>
              <h3 className="text-lg font-bold font-heading text-[#20211E] mb-2">Unrealistic Tool Requirements</h3>
              <p className="text-sm text-[#20211E]/75 leading-relaxed">
                DIY guides frequently assume table saws, 3D printers, and specialty clamps that standard households do not possess.
              </p>
            </div>
            <div className="p-6 border border-[#20211E]/10 bg-[#F7F5EF]">
              <span className="text-xs font-mono font-bold text-[#FF6B35] block mb-2">03 / REALITY</span>
              <h3 className="text-lg font-bold font-heading text-[#20211E] mb-2">Unrecorded Failures</h3>
              <p className="text-sm text-[#20211E]/75 leading-relaxed">
                When a homemade project bends or sags, that lesson is usually forgotten instead of feeding into a stronger second attempt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#20211E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-3">
              02. How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#20211E] font-heading leading-tight">
              Four stages from salvage to smarter builds.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stage 1: Gather */}
            <div className="p-6 border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#173D32] text-white font-mono font-bold text-sm mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">Gather</h3>
                <p className="text-sm text-[#20211E]/80 leading-relaxed mb-4">
                  Show what materials you have on hand. Enter cardboard scraps, bottles, wood offcuts, wire, or remnants, plus what basic tools you own.
                </p>
              </div>
              <span className="text-xs font-mono text-[#173D32] pt-4 border-t border-[#20211E]/10">
                Manual inputs or quick lists
              </span>
            </div>

            {/* Stage 2: Imagine */}
            <div className="p-6 border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#FF6B35] text-white font-mono font-bold text-sm mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">Imagine</h3>
                <p className="text-sm text-[#20211E]/80 leading-relaxed mb-4">
                  Discover three distinct, grounded invention concepts tailored strictly to your inventory, budget ceiling, and difficulty preference.
                </p>
              </div>
              <span className="text-xs font-mono text-[#FF6B35] pt-4 border-t border-[#20211E]/10">
                3 diverse concepts per run
              </span>
            </div>

            {/* Stage 3: Build */}
            <div className="p-6 border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#20211E] text-white font-mono font-bold text-sm mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">Build</h3>
                <p className="text-sm text-[#20211E]/80 leading-relaxed mb-4">
                  Follow step-by-step construction guidance, tool precautions, and cut layout tips. Check off steps as you assemble your prototype.
                </p>
              </div>
              <span className="text-xs font-mono text-[#20211E] pt-4 border-t border-[#20211E]/10">
                Interactive step checklist
              </span>
            </div>

            {/* Stage 4: Learn */}
            <div className="p-6 border border-[#20211E]/15 bg-[#173D32] text-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 flex items-center justify-center bg-white text-[#173D32] font-mono font-bold text-sm mb-6">
                  04
                </div>
                <h3 className="text-xl font-bold font-heading text-white mb-2">Learn</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                  Log whether the build worked, sagged, or lacked glue. SCRAPSHIFT records the physical outcome and applies that exact lesson next time.
                </p>
              </div>
              <span className="text-xs font-mono text-[#FF6B35] pt-4 border-t border-white/20">
                Continual feedback engine
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE LEARNING LOOP */}
      <section className="py-20 md:py-28 bg-[#173D32] text-white border-b border-[#20211E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-widest font-bold text-[#FF6B35] font-heading block">
                03. The Continual Learning Loop
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
                Your next attempt should know what the last one taught you.
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                Construction failures are not mistakes; they are structural feedback. When a cardboard bracket bends, a wick draws too much liquid, or a joint binds, recording that outcome changes how the next recommendation is generated.
              </p>

              {/* Demo Button */}
              <div className="pt-2">
                <button
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-3 px-6 py-3.5 text-xs uppercase tracking-wider font-bold text-[#20211E] bg-[#F7F5EF] hover:bg-white transition-colors font-heading"
                >
                  <Play className="w-4 h-4 text-[#FF6B35] fill-current" />
                  Walk through the Phone Stand demo
                </button>
              </div>

              <div className="p-4 bg-white/10 border border-white/15 text-xs text-white/70">
                <span className="font-bold text-white block mb-1">Illustrative Example Notice:</span>
                This feedback flow represents an illustrative maker example, not a physically lab-certified or simulated result. Material variations require physical verification on your workbench.
              </div>
            </div>

            {/* Visual Narrative Box of the Learning Loop */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 bg-[#20211E] border border-white/15 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono text-white/60">
                  <span>LEARNING SEQUENCE</span>
                  <span className="text-[#FF6B35]">LIVE RETRIEVAL SIMULATION</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 space-y-1">
                    <span className="text-xs font-mono text-[#FF6B35]">STEP 1 / INITIAL BUILD</span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      Single-Flute Cardboard Phone Stand
                    </h4>
                    <p className="text-xs text-white/70">
                      Constructed using horizontal fold line on single-wall cardboard.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FF6B35]/20 border border-[#FF6B35]/40 space-y-1">
                    <span className="text-xs font-mono text-[#FF6B35]">STEP 2 / RECORDED OUTCOME</span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      Reported: "Failed - Cardboard bent at horizontal crease under phone weight"
                    </h4>
                    <p className="text-xs text-white/80">
                      User recorded that the back cradle deflected slowly during extended video use.
                    </p>
                  </div>

                  <div className="p-4 bg-[#173D32] border border-white/20 space-y-1">
                    <span className="text-xs font-mono text-white/70">STEP 3 / NEXT GENERATION RETRIEVAL</span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      Tri-Truss Interlocking Phone Station (v2)
                    </h4>
                    <p className="text-xs text-white/90">
                      Engine considers the past bending failure and adjusts recommendation: rotates flute grain vertically and adds two triangular gusset braces.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-[#FF6B35] flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Feedback automatically logged to your browser's Learning Journal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: EXAMPLE INVENTIONS */}
      <section className="py-20 md:py-28 border-b border-[#20211E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-3">
              04. Example Inventions
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#20211E] font-heading leading-tight mb-4">
              Real concept prototypes from common salvage.
            </h2>
            <p className="text-sm sm:text-base text-[#20211E]/75">
              These illustrative concepts demonstrate how geometry, joinery, and reclaimed materials unite to solve real space and tool friction. Treated as concepts, not verified physical lab results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Example 1: Desk Organizer */}
            <div className="border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col">
              <div className="aspect-[4/3] bg-[#E8E4DA] overflow-hidden border-b border-[#20211E]/10">
                <img
                  src="/src/assets/images/concept_cardboard_organizer_1792255110536.jpg"
                  alt="Precision cut cardboard desk organizer concept"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-[#173D32] mb-1">CONCEPT 01 / DESK UTILITY</div>
                  <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">
                    Cardboard Desk Organizer
                  </h3>
                  <p className="text-xs text-[#20211E]/75 leading-relaxed mb-3">
                    Interlocking vertical divider channels fabricated from double-wall shipping carton scraps. Holds notebooks, drafting pens, and small tools.
                  </p>
                  <div className="space-y-1 text-xs border-t border-[#20211E]/10 pt-3">
                    <p><strong className="text-[#20211E]">Source materials:</strong> Corrugated carton sheets, scrap card stock.</p>
                    <p><strong className="text-[#20211E]">Intended use:</strong> Compact desk clutter sorting.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/create')}
                  className="w-full py-2.5 text-xs uppercase tracking-wider font-bold text-[#20211E] border border-[#20211E] hover:bg-[#20211E] hover:text-white transition-colors font-heading text-center"
                >
                  Build with Cardboard
                </button>
              </div>
            </div>

            {/* Example 2: Recycled-Container Planter */}
            <div className="border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col">
              <div className="aspect-[4/3] bg-[#E8E4DA] overflow-hidden border-b border-[#20211E]/10">
                <img
                  src="/src/assets/images/concept_reclaimed_planter_1792255110783.jpg"
                  alt="Inverted bottle self-watering planter concept"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-[#173D32] mb-1">CONCEPT 02 / BOTANICAL</div>
                  <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">
                    Recycled Container Planter
                  </h3>
                  <p className="text-xs text-[#20211E]/75 leading-relaxed mb-3">
                    A clean inverted glass bottle funnel set inside a lower reservoir base with an unbleached cotton wick for passive soil hydration.
                  </p>
                  <div className="space-y-1 text-xs border-t border-[#20211E]/10 pt-3">
                    <p><strong className="text-[#20211E]">Source materials:</strong> Glass bottle or jar, natural cotton twine.</p>
                    <p><strong className="text-[#20211E]">Intended use:</strong> Windowsill herb or seedling cultivation.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/create')}
                  className="w-full py-2.5 text-xs uppercase tracking-wider font-bold text-[#20211E] border border-[#20211E] hover:bg-[#20211E] hover:text-white transition-colors font-heading text-center"
                >
                  Build with Glass
                </button>
              </div>
            </div>

            {/* Example 3: Reclaimed Packaging Storage */}
            <div className="border border-[#20211E]/15 bg-[#F7F5EF] flex flex-col">
              <div className="aspect-[4/3] bg-[#E8E4DA] overflow-hidden border-b border-[#20211E]/10">
                <img
                  src="/src/assets/images/concept_packaging_storage_1792255110822.jpg"
                  alt="Modular reclaimed packaging storage solution concept"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-[#173D32] mb-1">CONCEPT 03 / WORKSHOP STORAGE</div>
                  <h3 className="text-xl font-bold font-heading text-[#20211E] mb-2">
                    Reclaimed Packaging Storage
                  </h3>
                  <p className="text-xs text-[#20211E]/75 leading-relaxed mb-3">
                    Multi-drawer nesting bin system crafted from uniform delivery packaging, reinforced slide rails, and upcycled pull tabs.
                  </p>
                  <div className="space-y-1 text-xs border-t border-[#20211E]/10 pt-3">
                    <p><strong className="text-[#20211E]">Source materials:</strong> Shipping boxes, wooden dowel scraps, tape.</p>
                    <p><strong className="text-[#20211E]">Intended use:</strong> Hardware and fastener organization.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/create')}
                  className="w-full py-2.5 text-xs uppercase tracking-wider font-bold text-[#20211E] border border-[#20211E] hover:bg-[#20211E] hover:text-white transition-colors font-heading text-center"
                >
                  Build Storage System
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CALL TO ACTION */}
      <section className="py-20 md:py-28 bg-[#E8E4DA]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block">
            Ready to Build
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#20211E] font-heading leading-tight">
            Start with what is already around you.
          </h2>
          <p className="text-base sm:text-xl text-[#20211E]/80 max-w-2xl mx-auto leading-relaxed">
            You do not need a perfect workshop. You need a few materials and something worth solving.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm uppercase tracking-wider font-bold text-white bg-[#FF6B35] hover:bg-[#E85A26] transition-all font-heading shadow-sm"
            >
              Find my first build
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/learning')}
              className="px-6 py-4 text-sm uppercase tracking-wider font-bold text-[#20211E] border border-[#20211E]/30 hover:border-[#20211E] bg-white transition-all font-heading"
            >
              View Learning Journal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
