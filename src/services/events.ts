/**
 * KrtLab Intelligence Events System
 * 
 * Canonical event model for all learning actions.
 * Every meaningful learning action produces a structured event.
 * Events feed the Intelligence Core → update Learner State.
 */

import type { IntelligenceEvent, IntelligenceEventType } from "../types/learner";

const EVENTS_KEY = "krtlab_events";
const MAX_EVENTS = 500;

// ============================================================================
// EVENT PRODUCTION
// ============================================================================

const EVENT_VERSION = 1;

function makeEvent(
  type: IntelligenceEventType,
  payload: Record<string, unknown>,
  learnerId: string,
  related?: { goal?: string; skill?: string; concept?: string }
): IntelligenceEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    learnerId,
    type,
    timestamp: new Date().toISOString(),
    relatedGoal: related?.goal,
    relatedSkill: related?.skill,
    relatedConcept: related?.concept,
    source: "krtlab-engine",
    payload,
    schemaVersion: EVENT_VERSION,
  };
}

// ============================================================================
// EVENT PERSISTENCE
// ============================================================================

function getEvents(): IntelligenceEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: IntelligenceEvent[]): void {
  const trimmed = events.slice(-MAX_EVENTS); // keep last N
  localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function recordEvent(
  type: IntelligenceEventType,
  payload: Record<string, unknown> = {},
  learnerId: string = "anonymous",
  related?: { goal?: string; skill?: string; concept?: string }
): IntelligenceEvent {
  const event = makeEvent(type, payload, learnerId, related);
  const events = getEvents();
  events.push(event);
  saveEvents(events);
  return event;
}

export function getRecentEvents(limit: number = 50): IntelligenceEvent[] {
  return getEvents().slice(-limit).reverse();
}

export function getEventsByType(type: IntelligenceEventType, limit: number = 50): IntelligenceEvent[] {
  return getEvents().filter(e => e.type === type).slice(-limit).reverse();
}

export function getEventsForGoal(goalId: string, limit: number = 50): IntelligenceEvent[] {
  return getEvents().filter(e => e.relatedGoal === goalId).slice(-limit).reverse();
}

export function getEventsForSkill(skillId: string, limit: number = 50): IntelligenceEvent[] {
  return getEvents().filter(e => e.relatedSkill === skillId).slice(-limit).reverse();
}

export function getEventStats(): {
  total: number;
  byType: Record<string, number>;
  recentTypes: IntelligenceEventType[];
} {
  const events = getEvents();
  const byType: Record<string, number> = {};
  const recentTypes: IntelligenceEventType[] = [];

  for (const e of events) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }

  // Most recent types
  for (let i = events.length - 1; i >= 0 && recentTypes.length < 10; i--) {
    if (!recentTypes.includes(events[i].type)) {
      recentTypes.push(events[i].type);
    }
  }

  return { total: events.length, byType, recentTypes };
}

export function clearEvents(): void {
  localStorage.removeItem(EVENTS_KEY);
}

// ============================================================================
// CONVENIENCE RECORDERS
// ============================================================================

export const Events = {
  goalCreated(learnerId: string, goalTitle: string, goalId: string) {
    return recordEvent("GOAL_CREATED", { goalTitle, goalId }, learnerId, { goal: goalId });
  },

  goalUpdated(learnerId: string, goalId: string, progress: number) {
    return recordEvent("GOAL_UPDATED", { goalId, progress }, learnerId, { goal: goalId });
  },

  lessonStarted(learnerId: string, lessonId: string, skillId: string) {
    return recordEvent("LESSON_STARTED", { lessonId }, learnerId, { skill: skillId });
  },

  lessonCompleted(learnerId: string, lessonId: string, skillId: string, quizScore: number) {
    return recordEvent("LESSON_COMPLETED", { lessonId, quizScore }, learnerId, { skill: skillId });
  },

  assessmentCompleted(learnerId: string, skillId: string, score: number, mistakes: string[]) {
    return recordEvent("ASSESSMENT_COMPLETED", { score, mistakes }, learnerId, { skill: skillId });
  },

  skillImproved(learnerId: string, skillId: string, oldLevel: number, newLevel: number) {
    return recordEvent("SKILL_IMPROVED", { skillId, oldLevel, newLevel }, learnerId, { skill: skillId });
  },

  projectCompleted(learnerId: string, projectId: string, title: string) {
    return recordEvent("PROJECT_COMPLETED", { projectId, title }, learnerId);
  },

  achievementEarned(learnerId: string, achievementId: string) {
    return recordEvent("ACHIEVEMENT_EARNED", { achievementId }, learnerId);
  },
};
