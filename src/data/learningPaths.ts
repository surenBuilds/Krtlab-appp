import { 
  Rocket, 
  TrendingUp, 
  Code, 
  Languages as LangIcon, 
  Beaker, 
  User, 
  Brain, 
  ShieldCheck, 
  Briefcase,
  Zap,
  Globe,
  Database,
  Cpu,
  Lock,
  Search,
  MessageSquare,
  BarChart,
  Lightbulb,
  Target,
  PenTool,
  Network,
  Binary,
  Infinity,
  FlaskConical,
  Microscope,
  Compass,
  Layout,
  Smartphone,
  Server,
  Terminal,
  Activity,
  Award,
  BookOpen,
  Heart,
  RefreshCw
} from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningPathStep {
  categoryId: string;
  subfieldId: string;
  levelId: number;
  title: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  icon: any;
  recommended?: boolean;
  steps: LearningPathStep[];
}

export interface LearningCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  paths: LearningPath[];
}

export const CATEGORIZED_LEARNING_PATHS: LearningCategory[] = [
  {
    id: 'business',
    title: 'Բիզնես և Ձեռնարկատիրություն',
    description: 'Սովորիր կառուցել և կառավարել հաջողակ բիզնես զրոյից:',
    icon: Briefcase,
    paths: [
      {
        id: 'entrepreneur-14-days',
        title: 'Դարձիր ձեռնարկատեր 14 օրում',
        description: 'Ամբողջական ուղեցույց՝ գաղափարից մինչև առաջին վաճառք:',
        duration: '14 օր',
        difficulty: 'Beginner',
        icon: Rocket,
        recommended: true,
        steps: [
          { categoryId: 'business', subfieldId: 'entrepreneurship', levelId: 1, title: 'Ձեռնարկատիրության հիմունքներ' },
          { categoryId: 'business', subfieldId: 'entrepreneurship', levelId: 2, title: 'Շուկայի վերլուծություն' },
          { categoryId: 'business', subfieldId: 'entrepreneurship', levelId: 3, title: 'Բիզնես մոդելավորում' },
          { categoryId: 'business', subfieldId: 'entrepreneurship', levelId: 4, title: 'Ներդրումների ներգրավում' },
          { categoryId: 'business', subfieldId: 'entrepreneurship', levelId: 5, title: 'Վաճառքի ռազմավարություն' }
        ]
      },
      {
        id: 'startup-scaling',
        title: 'Ստարտափի մասշտաբավորում',
        description: 'Ինչպես մեծացնել բիզնեսը և դուրս գալ միջազգային շուկա:',
        duration: '21 օր',
        difficulty: 'Advanced',
        icon: TrendingUp,
        steps: [
          { categoryId: 'business', subfieldId: 'scaling', levelId: 1, title: 'Մասշտաբավորման նախապատրաստում' },
          { categoryId: 'business', subfieldId: 'scaling', levelId: 2, title: 'Միջազգային շուկաներ' },
          { categoryId: 'business', subfieldId: 'scaling', levelId: 3, title: 'Գործառնական էֆեկտիվություն' }
        ]
      },
      {
        id: 'financial-literacy',
        title: 'Ֆինանսական գրագիտություն',
        description: 'Կառավարիր քո բիզնեսի և անձնական ֆինանսները պրոֆեսիոնալ կերպով:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: BarChart,
        steps: [
          { categoryId: 'business', subfieldId: 'finance', levelId: 1, title: 'Հաշվապահության հիմունքներ' },
          { categoryId: 'business', subfieldId: 'finance', levelId: 2, title: 'Բյուջետավորում' },
          { categoryId: 'business', subfieldId: 'finance', levelId: 3, title: 'Ներդրումային հիմունքներ' }
        ]
      },
      {
        id: 'project-management',
        title: 'Նախագծերի կառավարում',
        description: 'Agile և Scrum մեթոդոլոգիաների կիրառումը բիզնեսում:',
        duration: '12 օր',
        difficulty: 'Intermediate',
        icon: Target,
        steps: [
          { categoryId: 'business', subfieldId: 'pm', levelId: 1, title: 'Project Management հիմունքներ' },
          { categoryId: 'business', subfieldId: 'pm', levelId: 2, title: 'Agile & Scrum' },
          { categoryId: 'business', subfieldId: 'pm', levelId: 3, title: 'Ռիսկերի կառավարում' }
        ]
      },
      {
        id: 'corporate-legal',
        title: 'Բիզնես իրավունք',
        description: 'Իրավաբանական հիմունքները ստարտափների և ՓՄՁ-ների համար:',
        duration: '8 օր',
        difficulty: 'Intermediate',
        icon: ShieldCheck,
        steps: [
          { categoryId: 'business', subfieldId: 'legal', levelId: 1, title: 'Ընկերության հիմնադրում' },
          { categoryId: 'business', subfieldId: 'legal', levelId: 2, title: 'Պայմանագրային իրավունք' }
        ]
      },
      {
        id: 'e-commerce-basics',
        title: 'Էլեկտրոնային առևտուր',
        description: 'Ինչպես բացել և զարգացնել առցանց խանութ:',
        duration: '14 օր',
        difficulty: 'Beginner',
        icon: Globe,
        steps: [
          { categoryId: 'business', subfieldId: 'ecommerce', levelId: 1, title: 'Հարթակների ընտրություն' },
          { categoryId: 'business', subfieldId: 'ecommerce', levelId: 2, title: 'Լոգիստիկա և վճարումներ' }
        ]
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Մարքեթինգ',
    description: 'Սովորիր գրավել հաճախորդներին և կառուցել հզոր բրենդ:',
    icon: TrendingUp,
    paths: [
      {
        id: 'digital-marketing-pro',
        title: 'Թվային մարքեթինգի մասնագետ',
        description: 'Սովորիր գովազդի և բրենդինգի ժամանակակից գործիքները:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: Zap,
        recommended: true,
        steps: [
          { categoryId: 'marketing', subfieldId: 'digital', levelId: 1, title: 'Թվային մարքեթինգի հիմունքներ' },
          { categoryId: 'marketing', subfieldId: 'digital', levelId: 2, title: 'Սոցիալական մեդիա մարքեթինգ' },
          { categoryId: 'marketing', subfieldId: 'digital', levelId: 3, title: 'SEO հիմունքներ' }
        ]
      },
      {
        id: 'content-strategy',
        title: 'Բովանդակության ռազմավարություն',
        description: 'Ստեղծիր բովանդակություն, որը վաճառում է և ներգրավում:',
        duration: '14 օր',
        difficulty: 'Intermediate',
        icon: PenTool,
        steps: [
          { categoryId: 'marketing', subfieldId: 'content', levelId: 1, title: 'Քոփիրայթինգ' },
          { categoryId: 'marketing', subfieldId: 'content', levelId: 2, title: 'Վիզուալ սթորիթելինգ' }
        ]
      },
      {
        id: 'brand-building',
        title: 'Բրենդինգ և իմիջ',
        description: 'Ինչպես ստեղծել ճանաչելի և սիրված բրենդ:',
        duration: '15 օր',
        difficulty: 'Advanced',
        icon: Award,
        steps: [
          { categoryId: 'marketing', subfieldId: 'branding', levelId: 1, title: 'Բրենդի ինքնություն' },
          { categoryId: 'marketing', subfieldId: 'branding', levelId: 2, title: 'Շուկայական դիրքավորում' }
        ]
      },
      {
        id: 'performance-marketing',
        title: 'Performance Մարքեթինգ',
        description: 'Google Ads և Facebook Ads խորացված դասընթաց:',
        duration: '20 օր',
        difficulty: 'Advanced',
        icon: BarChart,
        steps: [
          { categoryId: 'marketing', subfieldId: 'performance', levelId: 1, title: 'Data-driven մարքեթինգ' },
          { categoryId: 'marketing', subfieldId: 'performance', levelId: 2, title: 'Գովազդային օպտիմալացում' }
        ]
      },
      {
        id: 'pr-communications',
        title: 'PR և Հաղորդակցություն',
        description: 'Կառավարիր ընկերության հանրային կապերը և իմիջը:',
        duration: '12 օր',
        difficulty: 'Intermediate',
        icon: MessageSquare,
        steps: [
          { categoryId: 'marketing', subfieldId: 'pr', levelId: 1, title: 'Մեդիա հարաբերություններ' },
          { categoryId: 'marketing', subfieldId: 'pr', levelId: 2, title: 'Ճգնաժամային հաղորդակցություն' }
        ]
      },
      {
        id: 'influencer-marketing',
        title: 'Ինֆլուենսեր Մարքեթինգ',
        description: 'Ինչպես աշխատել բլոգերների և ազդեցիկ մարդկանց հետ:',
        duration: '8 օր',
        difficulty: 'Beginner',
        icon: User,
        steps: [
          { categoryId: 'marketing', subfieldId: 'influencer', levelId: 1, title: 'Գործընկերների ընտրություն' }
        ]
      }
    ]
  },
  {
    id: 'technology',
    title: 'Տեխնոլոգիաներ / Ծրագրավորում',
    description: 'Սովորիր ապագայի ամենապահանջված մասնագիտությունները:',
    icon: Code,
    paths: [
      {
        id: 'fullstack-web',
        title: 'Full-Stack Web Developer',
        description: 'Սովորիր ստեղծել ժամանակակից վեբ կայքեր React-ով և Node.js-ով:',
        duration: '30 օր',
        difficulty: 'Intermediate',
        icon: Layout,
        recommended: true,
        steps: [
          { categoryId: 'technology', subfieldId: 'web', levelId: 1, title: 'Frontend հիմունքներ' },
          { categoryId: 'technology', subfieldId: 'web', levelId: 2, title: 'React framework' },
          { categoryId: 'technology', subfieldId: 'web', levelId: 3, title: 'Backend & APIs' }
        ]
      },
      {
        id: 'mobile-dev',
        title: 'Mobile App Development',
        description: 'Ստեղծիր հավելվածներ iOS և Android հարթակների համար:',
        duration: '25 օր',
        difficulty: 'Intermediate',
        icon: Smartphone,
        steps: [
          { categoryId: 'technology', subfieldId: 'mobile', levelId: 1, title: 'React Native հիմունքներ' },
          { categoryId: 'technology', subfieldId: 'mobile', levelId: 2, title: 'Native APIs ինտեգրում' }
        ]
      },
      {
        id: 'ai-ml',
        title: 'Արհեստական Բանականություն',
        description: 'Սովորիր Python-ի և Machine Learning-ի աշխարհը:',
        duration: '40 օր',
        difficulty: 'Advanced',
        icon: Cpu,
        steps: [
          { categoryId: 'technology', subfieldId: 'ai', levelId: 1, title: 'Python տվյալների գիտության համար' },
          { categoryId: 'technology', subfieldId: 'ai', levelId: 2, title: 'Machine Learning հիմունքներ' }
        ]
      },
      {
        id: 'data-science',
        title: 'Data Science & Big Data',
        description: 'Վերլուծիր մեծ տվյալները և կայացրու ճիշտ որոշումներ:',
        duration: '35 օր',
        difficulty: 'Advanced',
        icon: Database,
        steps: [
          { categoryId: 'technology', subfieldId: 'ds', levelId: 1, title: 'Վիճակագրություն' },
          { categoryId: 'technology', subfieldId: 'ds', levelId: 2, title: 'SQL & Database Design' }
        ]
      },
      {
        id: 'cloud-computing',
        title: 'Cloud Computing (AWS/Azure)',
        description: 'Կառավարիր ամպային ենթակառուցվածքները պրոֆեսիոնալ մակարդակով:',
        duration: '20 օր',
        difficulty: 'Intermediate',
        icon: Server,
        steps: [
          { categoryId: 'technology', subfieldId: 'cloud', levelId: 1, title: 'Ամպային տեխնոլոգիաների ներածություն' }
        ]
      },
      {
        id: 'game-dev',
        title: 'Խաղերի մշակում (Unity/C#)',
        description: 'Ստեղծիր քո սեփական 3D և 2D խաղերը:',
        duration: '45 օր',
        difficulty: 'Advanced',
        icon: Zap,
        steps: [
          { categoryId: 'technology', subfieldId: 'game', levelId: 1, title: 'Unity Engine հիմունքներ' }
        ]
      }
    ]
  },
  {
    id: 'languages',
    title: 'Լեզուներ',
    description: 'Բացահայտիր նոր աշխարհներ՝ սովորելով նոր լեզուներ:',
    icon: LangIcon,
    paths: [
      {
        id: 'english-business',
        title: 'Business English',
        description: 'Սովորիր գործնական անգլերեն մասնագիտական հաջողության համար:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: MessageSquare,
        recommended: true,
        steps: [
          { categoryId: 'languages', subfieldId: 'english', levelId: 1, title: 'Գործնական նամակագրություն' },
          { categoryId: 'languages', subfieldId: 'english', levelId: 2, title: 'Բանակցությունների լեզու' }
        ]
      },
      {
        id: 'german-beginner',
        title: 'Գերմաներեն զրոյից',
        description: 'Արագ և արդյունավետ սկիզբ դեպի գերմաներեն լեզու:',
        duration: '12 օր',
        difficulty: 'Beginner',
        icon: Globe,
        steps: [
          { categoryId: 'languages', subfieldId: 'german', levelId: 1, title: 'Այբուբեն և արտասանություն' },
          { categoryId: 'languages', subfieldId: 'german', levelId: 2, title: 'Ամենօրյա երկխոսություն' }
        ]
      },
      {
        id: 'french-culture',
        title: 'Ֆրանսերեն և Մշակույթ',
        description: 'Սուզվիր ֆրանսիական մշակույթի և լեզվի մեջ:',
        duration: '20 օր',
        difficulty: 'Intermediate',
        icon: Compass,
        steps: [
          { categoryId: 'languages', subfieldId: 'french', levelId: 1, title: 'Հիմնական քերականություն' }
        ]
      },
      {
        id: 'spanish-travel',
        title: 'Իսպաներեն ճանապարհորդների համար',
        description: 'Այն ամենը, ինչ անհրաժեշտ է Իսպանիայում և Լատինական Ամերիկայում:',
        duration: '7 օր',
        difficulty: 'Beginner',
        icon: Compass,
        steps: [
          { categoryId: 'languages', subfieldId: 'spanish', levelId: 1, title: 'Ինքնակողմնորոշում' }
        ]
      },
      {
        id: 'chinese-intro',
        title: 'Չինարենի ներածություն',
        description: 'Հիերոգլիֆների և տոների բարդ, բայց հետաքրքիր աշխարհը:',
        duration: '30 օր',
        difficulty: 'Beginner',
        icon: PenTool,
        steps: [
          { categoryId: 'languages', subfieldId: 'chinese', levelId: 1, title: 'Տոներ և հնչյունաբանություն' }
        ]
      },
      {
        id: 'armenian-advanced',
        title: 'Հայոց լեզվի քերականություն',
        description: 'Խորացրու քո գիտելիքները մայրենի լեզվի մեջ:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: BookOpen,
        steps: [
          { categoryId: 'languages', subfieldId: 'armenian', levelId: 1, title: 'Ուղղագրություն' }
        ]
      }
    ]
  },
  {
    id: 'science',
    title: 'Գիտություն',
    description: 'Հասկացիր տիեզերքի և կյանքի գաղտնիքները:',
    icon: Beaker,
    paths: [
      {
        id: 'astrophysics',
        title: 'Աստղաֆիզիկա',
        description: 'Բացահայտիր աստղերի, գալակտիկաների և տիեզերքի ծագումը:',
        duration: '20 օր',
        difficulty: 'Advanced',
        icon: Infinity,
        recommended: true,
        steps: [
          { categoryId: 'science', subfieldId: 'astro', levelId: 1, title: 'Տիեզերական մարմիններ' },
          { categoryId: 'science', subfieldId: 'astro', levelId: 2, title: 'Ժամանակ և տարածություն' }
        ]
      },
      {
        id: 'modern-genetics',
        title: 'Ժամանակակից Գենետիկա',
        description: 'Ինչպես է աշխատում ԴՆԹ-ն և ինչպես է այն փոխում աշխարհը:',
        duration: '18 օր',
        difficulty: 'Advanced',
        icon: Microscope,
        steps: [
          { categoryId: 'science', subfieldId: 'genetics', levelId: 1, title: 'Մոլեկուլային կենսաբանություն' }
        ]
      },
      {
        id: 'quantum-physics',
        title: 'Քվանտային Ֆիզիկա',
        description: 'Միկրոաշխարհի տարօրինակ և զարմանալի կանոնները:',
        duration: '25 օր',
        difficulty: 'Advanced',
        icon: Zap,
        steps: [
          { categoryId: 'science', subfieldId: 'quantum', levelId: 1, title: 'Քվանտային մեխանիկա' }
        ]
      },
      {
        id: 'environmental-science',
        title: 'Բնապահպանություն',
        description: 'Հասկացիր կլիմայական փոփոխությունները և էկոլոգիան:',
        duration: '14 օր',
        difficulty: 'Intermediate',
        icon: Globe,
        steps: [
          { categoryId: 'science', subfieldId: 'eco', levelId: 1, title: 'Էկոհամակարգեր' }
        ]
      },
      {
        id: 'applied-chemistry',
        title: 'Կիրառական Քիմիա',
        description: 'Քիմիական պրոցեսները մեր առօրյա կյանքում:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: FlaskConical,
        steps: [
          { categoryId: 'science', subfieldId: 'chem', levelId: 1, title: 'Ռեակցիաներ և նյութեր' }
        ]
      },
      {
        id: 'neuroscience',
        title: 'Նեյրոգիտություն',
        description: 'Ինչպես է աշխատում մարդու ուղեղը:',
        duration: '22 օր',
        difficulty: 'Advanced',
        icon: Brain,
        steps: [
          { categoryId: 'science', subfieldId: 'neuro', levelId: 1, title: 'Նյարդային համակարգ' }
        ]
      }
    ]
  },
  {
    id: 'personal-development',
    title: 'Անհատական զարգացում',
    description: 'Դարձիր քո լավագույն տարբերակը:',
    icon: User,
    paths: [
      {
        id: 'time-management-master',
        title: 'Ժամանակի կառավարում',
        description: 'Ինչպես հասցնել ամեն ինչ և լինել ավելի արդյունավետ:',
        duration: '7 օր',
        difficulty: 'Beginner',
        icon: Activity,
        recommended: true,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'time', levelId: 1, title: 'Պրիորիտետների սահմանում' }
        ]
      },
      {
        id: 'public-speaking',
        title: 'Հանրային խոսք',
        description: 'Հաղթահարիր վախը և դարձիր ազդեցիկ խոսնակ:',
        duration: '10 օր',
        difficulty: 'Intermediate',
        icon: MessageSquare,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'speaking', levelId: 1, title: 'Ինքնավստահություն' }
        ]
      },
      {
        id: 'leadership-skills',
        title: 'Առաջնորդության հմտություններ',
        description: 'Ինչպես ոգեշնչել և կառավարել թիմեր:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: Target,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'leadership', levelId: 1, title: 'Թիմային աշխատանք' }
        ]
      },
      {
        id: 'critical-thinking',
        title: 'Քննադատական մտածողություն',
        description: 'Վերլուծիր տեղեկատվությունը և կայացրու ճիշտ որոշումներ:',
        duration: '12 օր',
        difficulty: 'Intermediate',
        icon: Brain,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'thinking', levelId: 1, title: 'Լոգիկայի հիմունքներ' }
        ]
      },
      {
        id: 'habit-building',
        title: 'Սովորությունների ձևավորում',
        description: 'Ինչպես ստեղծել օգտակար սովորություններ, որոնք կմնան:',
        duration: '21 օր',
        difficulty: 'Beginner',
        icon: RefreshCw,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'habits', levelId: 1, title: 'Ատոմային սովորություններ' }
        ]
      },
      {
        id: 'emotional-literacy',
        title: 'Էմոցիոնալ Գրագիտություն',
        description: 'Հասկացիր քո և ուրիշների էմոցիաները:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: Heart,
        steps: [
          { categoryId: 'personal-development', subfieldId: 'emotions', levelId: 1, title: 'Էմոցիաների ճանաչում' }
        ]
      }
    ]
  },
  {
    id: 'psychology',
    title: 'Հոգեբանություն',
    description: 'Հասկացիր մարդկային մտքի և վարքագծի աշխարհը:',
    icon: Brain,
    paths: [
      {
        id: 'cognitive-psych',
        title: 'Կոգնիտիվ Հոգեբանություն',
        description: 'Ինչպես ենք մենք մտածում, հիշում և սովորում:',
        duration: '14 օր',
        difficulty: 'Intermediate',
        icon: Brain,
        recommended: true,
        steps: [
          { categoryId: 'psychology', subfieldId: 'cognitive', levelId: 1, title: 'Մտավոր գործընթացներ' }
        ]
      },
      {
        id: 'emotional-intelligence',
        title: 'Էմոցիոնալ Ինտելեկտ (EQ)',
        description: 'Կառավարիր քո էմոցիաները և հասկացիր ուրիշներին:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: Activity,
        steps: [
          { categoryId: 'psychology', subfieldId: 'eq', levelId: 1, title: 'Ինքնաճանաչում' }
        ]
      },
      {
        id: 'behavioral-psych',
        title: 'Վարքագծային Հոգեբանություն',
        description: 'Ինչու են մարդիկ անում այն, ինչ անում են:',
        duration: '12 օր',
        difficulty: 'Intermediate',
        icon: Search,
        steps: [
          { categoryId: 'psychology', subfieldId: 'behavioral', levelId: 1, title: 'Խթան և արձագանք' }
        ]
      },
      {
        id: 'social-psych',
        title: 'Սոցիալական Հոգեբանություն',
        description: 'Խմբային դինամիկա և սոցիալական ազդեցություն:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: Globe,
        steps: [
          { categoryId: 'psychology', subfieldId: 'social', levelId: 1, title: 'Միջանձնային հարաբերություններ' }
        ]
      },
      {
        id: 'mental-health-basics',
        title: 'Հոգեկան առողջության հիմունքներ',
        description: 'Ինչպես պահպանել հոգեկան հավասարակշռությունը:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: ShieldCheck,
        steps: [
          { categoryId: 'psychology', subfieldId: 'mental', levelId: 1, title: 'Սթրեսի կառավարում' }
        ]
      },
      {
        id: 'productivity-mindset',
        title: 'Արդյունավետություն և Մտածելակերպ',
        description: 'Ինչպես հասնել առավելագույն արդյունքի նվազագույն ջանքերով:',
        duration: '12 օր',
        difficulty: 'Beginner',
        icon: Lightbulb,
        steps: [
          { categoryId: 'psychology', subfieldId: 'productivity', levelId: 1, title: 'Մտածելակերպի փոփոխություն' }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Կիբերանվտանգություն',
    description: 'Պաշտպանիր տվյալները և թվային աշխարհը:',
    icon: ShieldCheck,
    paths: [
      {
        id: 'ethical-hacking',
        title: 'Ethical Hacking',
        description: 'Սովորիր գտնել խոցելիություններ և ամրապնդել համակարգերը:',
        duration: '30 օր',
        difficulty: 'Advanced',
        icon: Terminal,
        recommended: true,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'hacking', levelId: 1, title: 'Ներթափանցման թեստավորում' }
        ]
      },
      {
        id: 'network-security',
        title: 'Ցանցային Անվտանգություն',
        description: 'Ինչպես պաշտպանել կորպորատիվ և անձնական ցանցերը:',
        duration: '20 օր',
        difficulty: 'Intermediate',
        icon: Network,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'network', levelId: 1, title: 'Firewalls & VPNs' }
        ]
      },
      {
        id: 'cryptography',
        title: 'Կրիպտոգրաֆիա',
        description: 'Տվյալների գաղտնագրման ժամանակակից մեթոդները:',
        duration: '25 օր',
        difficulty: 'Advanced',
        icon: Binary,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'crypto', levelId: 1, title: 'Encryption Algorithms' }
        ]
      },
      {
        id: 'web-security',
        title: 'Web Security',
        description: 'Վեբ հավելվածների պաշտպանություն հարձակումներից:',
        duration: '15 օր',
        difficulty: 'Intermediate',
        icon: Globe,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'web-sec', levelId: 1, title: 'OWASP Top 10' }
        ]
      },
      {
        id: 'cyber-privacy',
        title: 'Թվային Գաղտնիություն',
        description: 'Ինչպես պաշտպանել անձնական տվյալները համացանցում:',
        duration: '10 օր',
        difficulty: 'Beginner',
        icon: Lock,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'privacy', levelId: 1, title: 'Data Privacy' }
        ]
      },
      {
        id: 'threat-analysis',
        title: 'Կիբեր Սպառնալիքների Վերլուծություն',
        description: 'Ինչպես կանխատեսել և կանխել հարձակումները:',
        duration: '18 օր',
        difficulty: 'Advanced',
        icon: Activity,
        steps: [
          { categoryId: 'cybersecurity', subfieldId: 'threat', levelId: 1, title: 'Սպառնալիքների մոդելավորում' }
        ]
      }
    ]
  }
];

export const RECOMMENDED_PATHS = CATEGORIZED_LEARNING_PATHS.flatMap(cat => 
  cat.paths.filter(p => p.recommended)
);

export const getPersonalizedPaths = (goal: string, difficulty: Difficulty) => {
  let categoryId = 'business';
  if (goal === 'programmer') categoryId = 'technology';
  if (goal === 'marketing') categoryId = 'marketing';
  if (goal === 'english') categoryId = 'languages';

  const paths = CATEGORIZED_LEARNING_PATHS.find(c => c.id === categoryId)?.paths || [];
  
  return paths.filter(p => p.difficulty === difficulty || p.difficulty === 'Beginner');
};

// For backward compatibility or single list needs
export const LEARNING_PATHS = CATEGORIZED_LEARNING_PATHS.flatMap(cat => cat.paths);
