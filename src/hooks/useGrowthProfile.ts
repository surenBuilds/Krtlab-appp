/**
 * useGrowthProfile — Connects GrowthEngine events to user profile context.
 */
import { useCallback, useMemo } from "react";
import { useUserProfile } from "./useUserProfile";
import { onLessonCompleted, onProjectCompleted, onGoalProgress, calculateGrowthScore, buildMentorContext } from "../services/growthEngine";
import type { GrowthProfile, Goal, UserSkill, LearningProgressRecord, Project, Habit, CareerItem, MentorContext } from "../types/domain";

export function useGrowthProfile() {
  const userProfile = useUserProfile();
  const { profile, updateProfile } = userProfile;

  const dispatchLessonCompleted = useCallback((learningProgress: LearningProgressRecord) => {
    if (!profile) return;
    const result = onLessonCompleted({ profile: profile as unknown as GrowthProfile, learningProgress });
    updateProfile({ xp: result.updatedProfile.xp ?? profile.xp, lastActive: result.updatedProfile.lastActive });
    return result.recommendedActions;
  }, [profile, updateProfile]);

  const dispatchProjectCompleted = useCallback((project: Project) => {
    if (!profile) return;
    const result = onProjectCompleted({ profile: profile as unknown as GrowthProfile, project });
    updateProfile({ xp: result.updatedProfile.xp ?? profile.xp, lastActive: result.updatedProfile.lastActive });
    return result.recommendedActions;
  }, [profile, updateProfile]);

  const dispatchGoalProgress = useCallback((goal: Goal, progressDelta: number) => {
    if (!profile) return;
    const result = onGoalProgress({ profile: profile as unknown as GrowthProfile, goal, progressDelta });
    updateProfile({ xp: result.updatedProfile.xp ?? profile.xp, lastActive: result.updatedProfile.lastActive });
    return result.recommendedActions;
  }, [profile, updateProfile]);

  const getMentorContext = useCallback((params: { goals: Goal[]; skills: UserSkill[]; recentLearning: LearningProgressRecord[]; projects: Project[]; habits: Habit[]; careerItem?: CareerItem }): MentorContext | null => {
    if (!profile) return null;
    return buildMentorContext({ profile: profile as unknown as GrowthProfile, ...params });
  }, [profile]);

  const growthScore = useMemo(() => {
    if (!profile) return 0;
    return calculateGrowthScore({ profile: profile as unknown as GrowthProfile, skills: [], goals: [], projects: [], habits: [] });
  }, [profile]);

  return { ...userProfile, dispatchLessonCompleted, dispatchProjectCompleted, dispatchGoalProgress, getMentorContext, growthScore };
}
