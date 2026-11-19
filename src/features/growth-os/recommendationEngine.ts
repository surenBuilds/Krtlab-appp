export type MatchableOpportunity = {
  id: string;
  title: string;
  skills?: string[];
  type?: string;
  eligibility?: string;
};

export type LearnerMilestone = {
  title: string;
  skills: string[];
  completed: boolean;
};

export type LearnerRoadmap = {
  goal: string;
  milestones: LearnerMilestone[];
};

export type OpportunityMatch = {
  score: number;
  pathwayOverlap: string[];
  assessedSkills: string[];
  missingSkills: string[];
  explanation: string;
};

const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase().trim().replace(/[._-]+/g, " ").replace(/\s+/g, " ");

const unique = (values: string[]) =>
  [...new Map(values.filter(Boolean).map(value => [normalize(value), value.trim()])).values()];

export function matchOpportunity(
  opportunity: MatchableOpportunity,
  roadmap: LearnerRoadmap | null
): OpportunityMatch {
  const required = unique((opportunity.skills || []).filter(skill => skill.trim().length > 0));
  if (!roadmap || required.length === 0) {
    return {
      score: 0,
      pathwayOverlap: [],
      assessedSkills: [],
      missingSkills: required,
      explanation: !roadmap
        ? "Ստեղծեք ճանապարհային քարտեզ՝ համապատասխանությունը գնահատելու համար։"
        : "Հայտարարության մեջ հմտությունների պահանջներ նշված չեն, ուստի համընկնումը հաշվարկել հնարավոր չէ։",
    };
  }

  const targetSkills = new Set(
    roadmap.milestones.flatMap(milestone => milestone.skills).map(normalize)
  );
  const assessedSkills = new Set(
    roadmap.milestones
      .filter(milestone => milestone.completed)
      .flatMap(milestone => milestone.skills)
      .map(normalize)
  );

  const pathwayOverlap = required.filter(skill => targetSkills.has(normalize(skill)));
  const evidenceOverlap = required.filter(skill => assessedSkills.has(normalize(skill)));
  const missingSkills = required.filter(skill => !targetSkills.has(normalize(skill)));

  // This is a transparent skills-alignment indicator, not a hiring probability.
  const pathwayFit = pathwayOverlap.length / required.length;
  const evidenceCoverage = evidenceOverlap.length / required.length;
  const score = Math.round((pathwayFit * 0.7 + evidenceCoverage * 0.3) * 100);

  const explanation = evidenceOverlap.length
    ? `${evidenceOverlap.length} պահանջվող հմտություն համընկնում է գնահատմամբ ավարտված փուլերի հետ։`
    : pathwayOverlap.length
      ? `${pathwayOverlap.length} պահանջվող հմտություն ներառված է ձեր զարգացման ուղում, բայց դեռ գնահատված ավարտ չունի։`
      : "Այս հնարավորության պահանջները ներկայիս ճանապարհային քարտեզի հետ քիչ համընկնում ունեն։";

  return { score, pathwayOverlap, assessedSkills: evidenceOverlap, missingSkills, explanation };
}

export function rankOpportunities<T extends MatchableOpportunity>(
  opportunities: T[],
  roadmap: LearnerRoadmap | null
): Array<{ item: T; match: OpportunityMatch }> {
  return opportunities
    .map(item => ({ item, match: matchOpportunity(item, roadmap) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function matchCourseSkills(
  courseSkills: string[] | undefined,
  roadmap: LearnerRoadmap | null
): { score: number; relevantSkills: string[]; explanation: string } {
  const skills = unique(courseSkills || []);
  if (!roadmap || skills.length === 0) {
    return {
      score: 0,
      relevantSkills: [],
      explanation: "Հմտությունների համապատասխանությունը գնահատելու համար անհրաժեշտ են դասընթացի հմտություններ և ձեր ճանապարհային քարտեզը։",
    };
  }
  const targetSkills = new Set(roadmap.milestones.flatMap(m => m.skills).map(normalize));
  const relevantSkills = skills.filter(skill => targetSkills.has(normalize(skill)));
  return {
    score: Math.round((relevantSkills.length / skills.length) * 100),
    relevantSkills,
    explanation: relevantSkills.length
      ? `Դասընթացը զարգացնում է ձեր նպատակային ${relevantSkills.length} հմտություն։`
      : "Դասընթացի նշված հմտությունները չեն համընկնում ձեր ընթացիկ ճանապարհային քարտեզի հետ։",
  };
}
