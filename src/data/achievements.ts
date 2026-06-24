export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'xp' | 'streak' | 'lessons' | 'category';
    value: number;
    categoryId?: string;
  };
  reward: number; // XP reward
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Առաջին քայլ',
    description: 'Ավարտիր քո առաջին դասը',
    icon: 'Rocket',
    requirement: { type: 'lessons', value: 1 },
    reward: 100
  },
  {
    id: 'streak_3',
    title: 'Եռանդուն',
    description: 'Պահպանիր 3 օրվա շղթա',
    icon: 'Flame',
    requirement: { type: 'streak', value: 3 },
    reward: 200
  },
  {
    id: 'xp_1000',
    title: 'Գիտակ',
    description: 'Հավաքիր 1,000 XP',
    icon: 'Zap',
    requirement: { type: 'xp', value: 1000 },
    reward: 500
  },
  {
    id: 'finance_master',
    title: 'Ֆինանսիստ',
    description: 'Ավարտիր 5 դաս Ֆինանսներ բնագավառում',
    icon: 'Wallet',
    requirement: { type: 'category', value: 5, categoryId: 'finance' },
    reward: 300
  },
  {
    id: 'tech_enthusiast',
    title: 'Տեխնոլոգ',
    description: 'Ավարտիր 5 դաս Տեխնոլոգիաներ բնագավառում',
    icon: 'Cpu',
    requirement: { type: 'category', value: 5, categoryId: 'tech' },
    reward: 300
  },
  {
    id: 'streak_7',
    title: 'Անկասելի',
    description: 'Պահպանիր 7 օրվա շղթա',
    icon: 'Trophy',
    requirement: { type: 'streak', value: 7 },
    reward: 1000
  }
];
