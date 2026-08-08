/**
 * Skill-to-Subfield Mapping
 * 
 * When a user completes a learning subfield, these are the skills
 * that should gain evidence points.
 * 
 * Each subfield maps to one or more skills with point values.
 * Points are proportional to the level completed and difficulty.
 */

import type { SkillPoints } from '../types/domain';

export interface SubfieldSkillMapping {
  categoryId: string;
  subfieldId: string;
  skills: SkillPoints[];
}

/** 
 * Skills catalog — all skills the platform can track.
 * These are seeded per-user as they encounter them.
 */
export interface SkillDefinition {
  id: string; // stable slug, e.g. 'python-programming'
  name: string; // display name
  category: string; // grouping
  description: string;
  icon: string; // lucide icon name
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Business
  { id: 'entrepreneurship', name: 'Ձեռնարկատիրություն', category: 'business', description: 'Starting and running a business venture', icon: 'Rocket' },
  { id: 'marketing', name: 'Մարքեթինգ', category: 'business', description: 'Market strategy and brand communication', icon: 'Megaphone' },
  { id: 'sales', name: 'Վաճառքներ', category: 'business', description: 'Professional sales and negotiation', icon: 'TrendingUp' },
  { id: 'strategic-management', name: 'Ռազմավարական կառավարում', category: 'business', description: 'Strategic planning and execution', icon: 'Compass' },
  { id: 'hr-management', name: 'HR Կառավարում', category: 'business', description: 'Human resources and team management', icon: 'Users' },
  { id: 'business-ethics', name: 'Բիզնես էթիկա', category: 'business', description: 'Ethical decision-making in business', icon: 'Scale' },
  
  // Finance
  { id: 'personal-finance', name: 'Անձնական ֆինանսներ', category: 'finance', description: 'Personal financial planning', icon: 'Wallet' },
  { id: 'investments', name: 'Ներդրումներ', category: 'finance', description: 'Investment strategies and portfolio management', icon: 'BarChart' },
  { id: 'financial-analysis', name: 'Ֆինանսական վերլուծություն', category: 'finance', description: 'Financial statement analysis and modeling', icon: 'LineChart' },
  { id: 'economics', name: 'Տնտեսագիտություն', category: 'finance', description: 'Economic principles and market dynamics', icon: 'Globe' },
  { id: 'crypto-blockchain', name: 'Կրիպտո & Բլոկչեյն', category: 'finance', description: 'Cryptocurrency and blockchain technology', icon: 'Bitcoin' },
  
  // Technology
  { id: 'python-programming', name: 'Python', category: 'tech', description: 'Python programming language', icon: 'Terminal' },
  { id: 'javascript', name: 'JavaScript', category: 'tech', description: 'JavaScript/TypeScript programming', icon: 'Code' },
  { id: 'web-development', name: 'Վեբ ծրագրավորում', category: 'tech', description: 'Full-stack web development', icon: 'Globe' },
  { id: 'mobile-development', name: 'Մոբայլ ծրագրավորում', category: 'tech', description: 'Mobile app development', icon: 'Smartphone' },
  { id: 'ai-ml', name: 'AI & ML', category: 'tech', description: 'Artificial intelligence and machine learning', icon: 'Brain' },
  { id: 'cybersecurity', name: 'Կիբեռանվտանգություն', category: 'tech', description: 'Cybersecurity and data protection', icon: 'ShieldCheck' },
  { id: 'data-analysis', name: 'Տվյալների վերլուծություն', category: 'tech', description: 'Data analysis and visualization', icon: 'Database' },
  { id: 'cloud-computing', name: 'Ամպային տեխնոլոգիաներ', category: 'tech', description: 'Cloud infrastructure and services', icon: 'Cloud' },
  { id: 'devops', name: 'DevOps', category: 'tech', description: 'Development operations and CI/CD', icon: 'RefreshCw' },
  
  // Science
  { id: 'mathematics', name: 'Մաթեմատիկա', category: 'science', description: 'Mathematical reasoning and problem-solving', icon: 'Calculator' },
  { id: 'physics', name: 'Ֆիզիկա', category: 'science', description: 'Physical sciences and mechanics', icon: 'Atom' },
  { id: 'chemistry', name: 'Քիմիա', category: 'science', description: 'Chemical sciences', icon: 'FlaskConical' },
  { id: 'biology', name: 'Կենսաբանություն', category: 'science', description: 'Life sciences', icon: 'Microscope' },
  
  // Humanities
  { id: 'history', name: 'Պատմություն', category: 'humanities', description: 'Historical analysis and context', icon: 'BookOpen' },
  { id: 'psychology', name: 'Հոգեբանություն', category: 'humanities', description: 'Human behavior and cognitive science', icon: 'BrainCircuit' },
  { id: 'law', name: 'Իրավագիտություն', category: 'humanities', description: 'Legal frameworks and analysis', icon: 'Scale' },
  
  // Languages
  { id: 'english', name: 'Անգլերեն', category: 'languages', description: 'English language proficiency', icon: 'Languages' },
  { id: 'russian', name: 'Ռուսերեն', category: 'languages', description: 'Russian language proficiency', icon: 'Languages' },
  { id: 'french', name: 'Ֆրանսերեն', category: 'languages', description: 'French language proficiency', icon: 'Languages' },
  { id: 'german', name: 'Գերմաներեն', category: 'languages', description: 'German language proficiency', icon: 'Languages' },
  
  // Creative
  { id: 'graphic-design', name: 'Գրաֆիկ դիզայն', category: 'creative', description: 'Visual design and composition', icon: 'Palette' },
  { id: 'video-production', name: 'Վիդեո արտադրություն', category: 'creative', description: 'Video editing and production', icon: 'Video' },
  { id: 'music', name: 'Երաժշտություն', category: 'creative', description: 'Music theory and production', icon: 'Music' },
  
  // Soft Skills
  { id: 'critical-thinking', name: 'Քննադատական մտածողություն', category: 'soft-skills', description: 'Analytical reasoning and problem-solving', icon: 'Lightbulb' },
  { id: 'communication', name: 'Հաղորդակցում', category: 'soft-skills', description: 'Written and verbal communication', icon: 'MessageSquare' },
  { id: 'leadership', name: 'Առաջնորդություն', category: 'soft-skills', description: 'Team leadership and influence', icon: 'Award' },
  { id: 'time-management', name: 'Ժամանակի կառավարում', category: 'soft-skills', description: 'Productivity and time optimization', icon: 'Clock' },
];

/**
 * Maps each subfield to the skills it contributes to.
 * Points are configured per subfield — the actual award scales with level completed.
 */
export const SUBFIELD_SKILL_MAP: SubfieldSkillMapping[] = [
  // Business subfields
  { categoryId: 'business', subfieldId: 'entrepreneurship', skills: [
    { skillId: 'entrepreneurship', points: 10 },
    { skillId: 'critical-thinking', points: 3 },
    { skillId: 'leadership', points: 2 },
  ]},
  { categoryId: 'business', subfieldId: 'marketing', skills: [
    { skillId: 'marketing', points: 10 },
    { skillId: 'communication', points: 4 },
    { skillId: 'critical-thinking', points: 3 },
  ]},
  { categoryId: 'business', subfieldId: 'sales', skills: [
    { skillId: 'sales', points: 10 },
    { skillId: 'communication', points: 6 },
    { skillId: 'time-management', points: 2 },
  ]},
  { categoryId: 'business', subfieldId: 'strategic-management', skills: [
    { skillId: 'strategic-management', points: 10 },
    { skillId: 'leadership', points: 5 },
    { skillId: 'critical-thinking', points: 5 },
  ]},
  { categoryId: 'business', subfieldId: 'hr-management', skills: [
    { skillId: 'hr-management', points: 10 },
    { skillId: 'communication', points: 4 },
    { skillId: 'leadership', points: 3 },
  ]},
  { categoryId: 'business', subfieldId: 'business-ethics', skills: [
    { skillId: 'business-ethics', points: 10 },
    { skillId: 'critical-thinking', points: 5 },
  ]},
  { categoryId: 'business', subfieldId: 'startups', skills: [
    { skillId: 'entrepreneurship', points: 8 },
    { skillId: 'strategic-management', points: 4 },
    { skillId: 'critical-thinking', points: 3 },
  ]},
  { categoryId: 'business', subfieldId: 'small-business-management', skills: [
    { skillId: 'entrepreneurship', points: 6 },
    { skillId: 'strategic-management', points: 4 },
    { skillId: 'time-management', points: 3 },
  ]},
  
  // Finance subfields
  { categoryId: 'finance', subfieldId: 'personal-finance', skills: [
    { skillId: 'personal-finance', points: 10 },
    { skillId: 'financial-analysis', points: 3 },
  ]},
  { categoryId: 'finance', subfieldId: 'investments', skills: [
    { skillId: 'investments', points: 10 },
    { skillId: 'financial-analysis', points: 5 },
    { skillId: 'critical-thinking', points: 3 },
  ]},
  { categoryId: 'finance', subfieldId: 'economics', skills: [
    { skillId: 'economics', points: 10 },
    { skillId: 'critical-thinking', points: 4 },
  ]},
  { categoryId: 'finance', subfieldId: 'crypto-blockchain', skills: [
    { skillId: 'crypto-blockchain', points: 10 },
    { skillId: 'investments', points: 3 },
  ]},
  { categoryId: 'finance', subfieldId: 'corporate-finance', skills: [
    { skillId: 'financial-analysis', points: 10 },
    { skillId: 'strategic-management', points: 3 },
  ]},
  { categoryId: 'finance', subfieldId: 'banking', skills: [
    { skillId: 'personal-finance', points: 5 },
    { skillId: 'economics', points: 5 },
  ]},
  { categoryId: 'finance', subfieldId: 'financial-thinking', skills: [
    { skillId: 'personal-finance', points: 5 },
    { skillId: 'critical-thinking', points: 7 },
  ]},
  
  // Technology subfields
  { categoryId: 'tech', subfieldId: 'python', skills: [
    { skillId: 'python-programming', points: 10 },
    { skillId: 'critical-thinking', points: 2 },
  ]},
  { categoryId: 'tech', subfieldId: 'javascript', skills: [
    { skillId: 'javascript', points: 10 },
    { skillId: 'web-development', points: 3 },
  ]},
  { categoryId: 'tech', subfieldId: 'web-development', skills: [
    { skillId: 'web-development', points: 10 },
    { skillId: 'javascript', points: 3 },
  ]},
  { categoryId: 'tech', subfieldId: 'mobile-app-development', skills: [
    { skillId: 'mobile-development', points: 10 },
    { skillId: 'javascript', points: 3 },
  ]},
  { categoryId: 'tech', subfieldId: 'ai', skills: [
    { skillId: 'ai-ml', points: 10 },
    { skillId: 'python-programming', points: 3 },
    { skillId: 'critical-thinking', points: 3 },
  ]},
  { categoryId: 'tech', subfieldId: 'cybersecurity', skills: [
    { skillId: 'cybersecurity', points: 10 },
    { skillId: 'critical-thinking', points: 3 },
  ]},
  { categoryId: 'tech', subfieldId: 'data-analysis', skills: [
    { skillId: 'data-analysis', points: 10 },
    { skillId: 'python-programming', points: 3 },
    { skillId: 'critical-thinking', points: 2 },
  ]},
  { categoryId: 'tech', subfieldId: 'cloud-computing', skills: [
    { skillId: 'cloud-computing', points: 10 },
    { skillId: 'devops', points: 3 },
  ]},
  
  // Science subfields
  { categoryId: 'science', subfieldId: 'math', skills: [{ skillId: 'mathematics', points: 10 }]},
  { categoryId: 'science', subfieldId: 'physics', skills: [{ skillId: 'physics', points: 10 }, { skillId: 'mathematics', points: 3 }]},
  { categoryId: 'science', subfieldId: 'chemistry', skills: [{ skillId: 'chemistry', points: 10 }]},
  { categoryId: 'science', subfieldId: 'biology', skills: [{ skillId: 'biology', points: 10 }]},
  
  // Humanities subfields
  { categoryId: 'humanities', subfieldId: 'history', skills: [{ skillId: 'history', points: 10 }, { skillId: 'critical-thinking', points: 3 }]},
  { categoryId: 'humanities', subfieldId: 'psychology', skills: [{ skillId: 'psychology', points: 10 }, { skillId: 'critical-thinking', points: 4 }]},
  { categoryId: 'humanities', subfieldId: 'law', skills: [{ skillId: 'law', points: 10 }, { skillId: 'critical-thinking', points: 5 }]},
  
  // Languages subfields
  { categoryId: 'languages', subfieldId: 'english', skills: [{ skillId: 'english', points: 10 }]},
  { categoryId: 'languages', subfieldId: 'russian', skills: [{ skillId: 'russian', points: 10 }]},
  { categoryId: 'languages', subfieldId: 'french', skills: [{ skillId: 'french', points: 10 }]},
  { categoryId: 'languages', subfieldId: 'german', skills: [{ skillId: 'german', points: 10 }]},
  
  // Creative subfields
  { categoryId: 'creative', subfieldId: 'graphic-design', skills: [{ skillId: 'graphic-design', points: 10 }]},
  { categoryId: 'creative', subfieldId: 'video-production', skills: [{ skillId: 'video-production', points: 10 }]},
  { categoryId: 'creative', subfieldId: 'music', skills: [{ skillId: 'music', points: 10 }]},
];

/**
 * Calculate skill points for a completed level.
 * Higher levels award proportionally more points.
 */
export function calculateSkillPoints(
  subfieldId: string, 
  categoryId: string, 
  levelId: number, 
  quizScore: number
): SkillPoints[] {
  const mapping = SUBFIELD_SKILL_MAP.find(
    m => m.subfieldId === subfieldId && m.categoryId === categoryId
  );
  
  if (!mapping) return [];
  
  // Level multiplier: 1-5 → 1x, 6-10 → 1.5x, 11-15 → 2x, 16-20 → 3x
  let levelMultiplier = 1;
  if (levelId >= 16) levelMultiplier = 3;
  else if (levelId >= 11) levelMultiplier = 2;
  else if (levelId >= 6) levelMultiplier = 1.5;
  
  // Score multiplier: scales 0-100% → 0.5x-1.5x
  const scoreMultiplier = 0.5 + (quizScore / 100);
  
  return mapping.skills.map(s => ({
    skillId: s.skillId,
    points: Math.round(s.points * levelMultiplier * scoreMultiplier),
  }));
}
