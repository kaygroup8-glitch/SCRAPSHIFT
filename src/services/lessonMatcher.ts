/**
 * Continual Learning & Lesson Matching Engine for SCRAPSHIFT
 * Evaluates past user-reported outcomes and translates recorded failure/success patterns
 * into structural design adjustments for newly generated inventions.
 */

import { LearningLesson, MaterialItem, InventionConstraint, LessonChangeNote } from '../types';
import { StorageService } from './storage';

export interface LessonMatchResult {
  matchedLessons: LearningLesson[];
  designDirectives: string[];
  changeNotes: LessonChangeNote[];
  summaryExplanation: string;
}

export const LessonMatcher = {
  /**
   * Find lessons in the user's persistent learning journal that share materials,
   * mechanisms, or structural failure points with the current invention request.
   */
  findRelevantLessons(
    materials: MaterialItem[],
    goal: string,
    constraints: InventionConstraint
  ): LessonMatchResult {
    const allLessons = StorageService.getLessons();
    if (allLessons.length === 0) {
      return {
        matchedLessons: [],
        designDirectives: [],
        changeNotes: [],
        summaryExplanation: 'No prior lessons match these specific materials or constraints yet. This design starts from foundational scrap engineering principles.',
      };
    }

    const materialKeywords = materials.flatMap((m) => {
      const tokens = m.name.toLowerCase().split(/\s+/);
      tokens.push(m.category.toLowerCase());
      return tokens;
    });

    const goalKeywords = goal.toLowerCase().split(/[\s_]+/);
    const intendedUseKeywords = (constraints.intendedUse || '').toLowerCase().split(/\s+/);

    const scoredMatches: { lesson: LearningLesson; score: number }[] = [];

    for (const lesson of allLessons) {
      let score = 0;

      // Check materials intersection
      for (const mat of lesson.materialsUsed) {
        const matLower = mat.toLowerCase();
        for (const userToken of materialKeywords) {
          if (userToken.length > 2 && matLower.includes(userToken)) {
            score += 3;
          }
        }
      }

      // Check category / goal intersection
      const categoryLower = lesson.category.toLowerCase();
      const titleLower = lesson.projectTitle.toLowerCase();
      const obsLower = lesson.userObservations.toLowerCase();

      for (const g of [...goalKeywords, ...intendedUseKeywords]) {
        if (g.length > 2) {
          if (categoryLower.includes(g) || titleLower.includes(g)) {
            score += 4;
          }
          if (obsLower.includes(g)) {
            score += 2;
          }
        }
      }

      // Special high-impact keywords (e.g. phone stand, bending, planter, wick, organizer)
      if (
        (goal.includes('phone') || goal.includes('desk') || goal.includes('organize')) &&
        (categoryLower.includes('phone') || categoryLower.includes('cardboard') || categoryLower.includes('organizer'))
      ) {
        score += 3;
      }

      if (
        (goal.includes('plant') || goal.includes('grow')) &&
        (categoryLower.includes('plant') || categoryLower.includes('wick') || categoryLower.includes('jar'))
      ) {
        score += 3;
      }

      // Prioritize lessons with negative outcomes because they demand corrective redesigns
      if (lesson.outcome === 'failed') score += 2;
      if (lesson.outcome === 'partially_worked') score += 1;
      if (lesson.outcome === 'too_difficult') score += 1;

      if (score >= 4) {
        scoredMatches.push({ lesson, score });
      }
    }

    // Sort by relevance score descending
    scoredMatches.sort((a, b) => b.score - a.score);
    const topLessons = scoredMatches.slice(0, 3).map((item) => item.lesson);

    if (topLessons.length === 0) {
      return {
        matchedLessons: [],
        designDirectives: [],
        changeNotes: [],
        summaryExplanation: 'No past recorded failures or adjustments directly matched this material and constraint set. The initial concept uses default baseline reinforcement.',
      };
    }

    // Convert top lessons into explicit design directives and change notes
    const designDirectives: string[] = [];
    const changeNotes: LessonChangeNote[] = [];

    for (const l of topLessons) {
      designDirectives.push(l.suggestedDesignAdjustment);
      changeNotes.push({
        lessonId: l.id,
        originalProblem: l.userObservations,
        whatChanged: l.suggestedDesignAdjustment,
        reason: `Based on your recorded observation from "${l.projectTitle}" (outcome: ${l.outcome.replace('_', ' ')}).`,
      });
    }

    const summaryExplanation = `Incorporate ${topLessons.length} prior learning journal record${
      topLessons.length > 1 ? 's' : ''
    } to reinforce structural weak points and avoid previous assembly bottlenecks.`;

    return {
      matchedLessons: topLessons,
      designDirectives,
      changeNotes,
      summaryExplanation,
    };
  },
};
