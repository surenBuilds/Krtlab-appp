export interface TranslationSchema {
  common: {
    back: string;
    loading: string;
    save: string;
    cancel: string;
    create: string;
    search: string;
    select: string;
    language: string;
    points: string;
    xp: string;
    streak: string;
    level: string;
    completed: string;
    notCompleted: string;
    welcome: string;
    progressToday: string;
    details: string;
    action: string;
    all: string;
    new: string;
    submit: string;
    close: string;
    success: string;
    error: string;
  };
  menu: {
    dashboard: string;
    learn: string;
    paths: string;
    lab: string;
    games: string;
    goals: string;
    mentorMarketplace: string;
    courseMarketplace: string;
    skillGraph: string;
    portfolio: string;
    careerCenter: string;
    orgDashboard: string;
    devPlatform: string;
    monetization: string;
    logout: string;
  };
  nav: {
    core: string;
    dashboard: string;
    learn: string;
    paths: string;
    lab: string;
    flashcards: string;
    goals: string;
    openModule: string;
    marketplaces: string;
    mentorMarketplace: string;
    courseMarketplace: string;
    professional: string;
    skillGraph: string;
    portfolio: string;
    careerCenter: string;
    institutions: string;
    orgDashboard: string;
    devPlatform: string;
    monetization: string;
    admin: string;
    schoolManagement: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    activeGoals: string;
    achievements: string;
    dailyDiscipline: string;
    recommendedLessons: string;
    yourStats: string;
  };
  mentorMarketplace: {
    title: string;
    subtitle: string;
    createMentor: string;
    creatorDashboard: string;
    allMentors: string;
    searchPlaceholder: string;
    mentorName: string;
    mentorRole: string;
    mentorBio: string;
    mentorPersona: string;
    mentorSubject: string;
    mentorPricing: string;
    mentorRating: string;
    subscribe: string;
    subscribed: string;
    unlocked: string;
    free: string;
    premium: string;
    myMentors: string;
    popularMentors: string;
    teachingStyle: string;
    monetizePrompt: string;
    earnMessage: string;
  };
  courseMarketplace: {
    title: string;
    subtitle: string;
    allCourses: string;
    createCourse: string;
    generateWithAI: string;
    enrolledCourses: string;
    duration: string;
    lessons: string;
    difficulty: string;
    price: string;
    enrollNow: string;
    enrolled: string;
    courseCreator: string;
    courseTitle: string;
    courseDesc: string;
    courseCategory: string;
    certificateAwarded: string;
  };
  skillGraph: {
    title: string;
    subtitle: string;
    interactiveGraph: string;
    completedSkills: string;
    inProgressSkills: string;
    lockedSkills: string;
    recommendedPath: string;
    recommendationMsg: string;
    clickNode: string;
    totalUnlocked: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    lifelongPassport: string;
    experience: string;
    githubProjects: string;
    achievements: string;
    coursesCompleted: string;
    certificationBadge: string;
    viewPublicProfile: string;
    addExperience: string;
    addProject: string;
    resumeTitle: string;
    skillsEndorsement: string;
  };
  career: {
    title: string;
    subtitle: string;
    recommendedJobs: string;
    matchScore: string;
    internships: string;
    applyNow: string;
    applied: string;
    company: string;
    location: string;
    requiredSkills: string;
    jobSearchPlaceholder: string;
  };
  orgDashboard: {
    title: string;
    subtitle: string;
    schools: string;
    universities: string;
    companies: string;
    studentManagement: string;
    cohortPerformance: string;
    analytics: string;
    activeStudents: string;
    averageGrade: string;
    cohortRetention: string;
    addStudent: string;
    inviteTeacher: string;
    aiCohortAnalysis: string;
  };
  devPlatform: {
    title: string;
    subtitle: string;
    sdkDocs: string;
    apiTokens: string;
    generateToken: string;
    apiTokenLabel: string;
    snippets: string;
    curlSnippet: string;
    nodeSnippet: string;
    pythonSnippet: string;
    integrationGuide: string;
  };
  monetization: {
    title: string;
    subtitle: string;
    freePlan: string;
    premiumPlan: string;
    enterprisePlan: string;
    creatorRevenue: string;
    platformCommission: string;
    subscriptionPrice: string;
    upgradeNow: string;
    currentPlan: string;
    activePlan: string;
    commissionRate: string;
    analyticsRevenue: string;
  };
}

export const hyTranslations: TranslationSchema = {
  common: {
    back: "Հետ",
    loading: "Բեռնում...",
    save: "Պահպանել",
    cancel: "Չեղարկել",
    create: "Ստեղծել",
    search: "Փնտրել...",
    select: "Ընտրել",
    language: "Լեզու",
    points: "Միավորներ",
    xp: "XP",
    streak: "Օրերի շարք",
    level: "Մակարդակ",
    completed: "Ավարտված",
    notCompleted: "Անավարտ",
    welcome: "Բարի գալուստ",
    progressToday: "Ահա քո այսօրվա առաջընթացը:",
    details: "Մանրամասներ",
    action: "Գործողություն",
    all: "Բոլորը",
    new: "Նոր",
    submit: "Ուղարկել",
    close: "Փակել",
    success: "Հաջողությամբ կատարվեց",
    error: "Տեղի է ունեցել սխալ"
  },
  menu: {
    dashboard: "Գլխավոր",
    learn: "Դասընթացներ",
    paths: "Ուղիներ",
    lab: "Լաբորատորիա",
    games: "Խաղեր",
    goals: "Նպակատներ",
    mentorMarketplace: "ԱԲ Մենթորներ",
    courseMarketplace: "Դասընթացներ",
    skillGraph: "Հմտությունների Քարտեզ",
    portfolio: "Իմ Պորտֆոլիոն",
    careerCenter: "Կարիերայի Կենտրոն",
    orgDashboard: "Կազմակերպություն",
    devPlatform: "Դեվելոփերներ",
    monetization: "Բաժանորդագրություն",
    logout: "Ելք"
  },
  nav: {
    core: "Հիմնական",
    dashboard: "Գլխավոր",
    learn: "Դասընթացներ",
    paths: "Ուղիներ",
    lab: "Լաբորատորիա",
    flashcards: "Քարտեր",
    goals: "Նպատակներ",
    openModule: "Բաց Մոդուլ",
    marketplaces: "Շուկաներ",
    mentorMarketplace: "ԱԲ Մենթորներ",
    courseMarketplace: "Դասընթացներ",
    professional: "Մասնագիտական",
    skillGraph: "Հմտությունների Քարտեզ",
    portfolio: "Իմ Պորտֆոլիոն",
    careerCenter: "Կարիերայի Կենտրոն",
    institutions: "Հաստատություններ",
    orgDashboard: "Կազմակերպություն",
    devPlatform: "Դեվելոփերներ",
    monetization: "Բաժանորդագրություն",
    admin: "Ադմինիստրացիա",
    schoolManagement: "Դպրոցի Կառավարում"
  },
  dashboard: {
    title: "Գլխավոր Էջ",
    subtitle: "Հետևեք ձեր առաջընթացին և զարգացրեք նոր հմտություններ:",
    activeGoals: "Ակտիվ Նպատակներ",
    achievements: "Ձեռքբերումներ",
    dailyDiscipline: "Օրվա Կարգապահություն",
    recommendedLessons: "Առաջարկվող Դասեր",
    yourStats: "Ձեր Վիճակագրությունը"
  },
  mentorMarketplace: {
    title: "ԱԲ Մենթորների Շուկա",
    subtitle: "Ստեղծեք, հարմարեցրեք և բաժանորդագրվեք լավագույն արհեստական բանականության մենթորներին:",
    createMentor: "Ստեղծել ԱԲ Մենթոր",
    creatorDashboard: "Հեղինակի Գրասենյակ",
    allMentors: "Բոլոր Մենթորները",
    searchPlaceholder: "Փնտրել ըստ անվան կամ մասնագիտացման...",
    mentorName: "Մենթորի Անունը",
    mentorRole: "Մասնագիտացում (դեր)",
    mentorBio: "Կենսագրություն / Նկարագրություն",
    mentorPersona: "Դասավանդման ոճ (Persona)",
    mentorSubject: "Առարկա",
    mentorPricing: "Ամսական գին ($)",
    mentorRating: "Վարկանիշ",
    subscribe: "Բաժանորդագրվել",
    subscribed: "Բաժանորդագրված է",
    unlocked: "Ապաբլոկավորված է",
    free: "Անվճար",
    premium: "Պրեմիում",
    myMentors: "Իմ Մենթորները",
    popularMentors: "Հանրաճանաչ Մենթորներ",
    teachingStyle: "Ուսուցման ոճ",
    monetizePrompt: "Մոնետիզացրեք ձեր գիտելիքները",
    earnMessage: "Ստեղծեք սեփական ԱԲ Մենթորը, տարածեք այն համայնքում և ստացեք եկամուտ:"
  },
  courseMarketplace: {
    title: "Դասընթացների Շուկա",
    subtitle: "Գտեք թե՛ մարդկանց, թե՛ ԱԲ-ի կողմից ստեղծված բարձրորակ դասընթացներ ցանկացած թեմայով:",
    allCourses: "Բոլոր Դասընթացները",
    createCourse: "Ստեղծել Դասընթաց",
    generateWithAI: "Գեներացնել ԱԲ-ով",
    enrolledCourses: "Իմ Դասընթացները",
    duration: "Տևողություն",
    lessons: "Դասեր",
    difficulty: "Բարդություն",
    price: "Գին",
    enrollNow: "Գրանցվել",
    enrolled: "Գրանցված է",
    courseCreator: "Հեղինակ",
    courseTitle: "Դասընթացի Անվանումը",
    courseDesc: "Նկարագրություն",
    courseCategory: "Կատեգորիա",
    certificateAwarded: "Հավաստագիր ավարտին"
  },
  skillGraph: {
    title: "Հմտությունների Գլոբալ Քարտեզ",
    subtitle: "Տեսողականորեն ուսումնասիրեք ձեր գիտելիքների ծառը և բացահայտեք հաջորդ քայլերը:",
    interactiveGraph: "Ինտերակտիվ Քարտեզ",
    completedSkills: "Յուրացված Հմտություններ",
    inProgressSkills: "Ուսումնասիրվող Հմտություններ",
    lockedSkills: "Կողպված Հմտություններ",
    recommendedPath: "ԱԲ Առաջարկվող Ուղի",
    recommendationMsg: "Հիմնվելով ձեր ընթացիկ հմտությունների վրա՝ խորհուրդ ենք տալիս անցնել 'Մեքենայական Ուսուցում' բաժինը:",
    clickNode: "Սեղմեք հանգույցին՝ մանրամասները տեսնելու համար",
    totalUnlocked: "Ապակողպված հմտություններ"
  },
  portfolio: {
    title: "Կրթական Պորտֆոլիո և Դիջիթալ Անձնագիր",
    subtitle: "Ձեր ցմահ կրթական անձնագիրը, որը ներկայացնում է ձեր բոլոր ձեռքբերումները:",
    lifelongPassport: "Ցմահ Դիջիթալ Անձնագիր",
    experience: "Փորձ",
    githubProjects: "GitHub Նախագծեր",
    achievements: "Նվաճումներ",
    coursesCompleted: "Ավարտված Դասընթացներ",
    certificationBadge: "Սերտիֆիկատների Կրծքանշաններ",
    viewPublicProfile: "Տեսնել հանրային էջը",
    addExperience: "Ավելացնել Փորձ",
    addProject: "Ավելացնել Նախագիծ",
    resumeTitle: "Ռեզյումեի Ամփոփում",
    skillsEndorsement: "Հաստատված Հմտություններ"
  },
  career: {
    title: "Կարիերայի Կենտրոն",
    subtitle: "Միացրեք ձեր գիտելիքները իրական աշխատանքային հնարավորությունների հետ:",
    recommendedJobs: "Առաջարկվող Աշխատանքներ",
    matchScore: "Համապատասխանություն",
    internships: "Պրակտիկա",
    applyNow: "Դիմել Հիմա",
    applied: "Դիմած է",
    company: "Ընկերություն",
    location: "Վայր",
    requiredSkills: "Պահանջվող Հմտություններ",
    jobSearchPlaceholder: "Որոնել ըստ տեխնոլոգիաների կամ պաշտոնի..."
  },
  orgDashboard: {
    title: "Կազմակերպությունների Գրասենյակ",
    subtitle: "Կառավարեք ուսանողներին, վերլուծեք առաջընթացը և կազմակերպեք կրթական գործընթացը:",
    schools: "Դպրոցներ",
    universities: "Համալսարաններ",
    companies: "Ընկերություններ",
    studentManagement: "Ուսանողների Կառավարում",
    cohortPerformance: "Խմբային Առաջադիմություն",
    analytics: "Վերլուծություն",
    activeStudents: "Ակտիվ Ուսանողներ",
    averageGrade: "Միջին Գնահատական",
    cohortRetention: "Խմբի Պահպանելիություն",
    addStudent: "Ավելացնել Ուսանող",
    inviteTeacher: "Հրավիրել Ուսուցիչ",
    aiCohortAnalysis: "ԱԲ Խմբային Վերլուծություն"
  },
  devPlatform: {
    title: "KrtLab Դեվելոփերների Պլատֆորմ",
    subtitle: "Ինտեգրեք KrtLab-ի ԱԲ կրթական հնարավորությունները ձեր սեփական ծրագրերում:",
    sdkDocs: "SDK Փաստաթղթեր",
    apiTokens: "API Տոկեններ",
    generateToken: "Ստեղծել Տոկեն",
    apiTokenLabel: "Ձեր API Տոկենը",
    snippets: "Կոդի Օրինակներ",
    curlSnippet: "cURL Օրինակ",
    nodeSnippet: "Node.js (TypeScript)",
    pythonSnippet: "Python Օրինակ",
    integrationGuide: "Ինտեգրման Ուղեցույց"
  },
  monetization: {
    title: "Մոնետիզացիա և Պլաններ",
    subtitle: "Ընտրեք ձեզ հարմար սակագնային պլանը կամ հետևեք ձեր հեղինակային եկամուտներին:",
    freePlan: "Անվճար Պլան",
    premiumPlan: "Պրեմիում Պլան",
    enterprisePlan: "Կորպորատիվ Պլան",
    creatorRevenue: "Հեղինակային Եկամուտ",
    platformCommission: "Միջնորդավճար",
    subscriptionPrice: "Ամսավճար",
    upgradeNow: "Ակտիվացնել Պրեմիում",
    currentPlan: "Ընթացիկ Պլան",
    activePlan: "Ակտիվ Պլան",
    commissionRate: "Միջնորդավճարի Չափ",
    analyticsRevenue: "Եկամտի Վիճակագրություն"
  }
};

export const enTranslations: TranslationSchema = {
  common: {
    back: "Back",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    create: "Create",
    search: "Search...",
    select: "Select",
    language: "Language",
    points: "Points",
    xp: "XP",
    streak: "Streak",
    level: "Level",
    completed: "Completed",
    notCompleted: "Not Completed",
    welcome: "Welcome",
    progressToday: "Here is your progress today:",
    details: "Details",
    action: "Action",
    all: "All",
    new: "New",
    submit: "Submit",
    close: "Close",
    success: "Success",
    error: "Error"
  },
  menu: {
    dashboard: "Dashboard",
    learn: "Courses",
    paths: "Paths",
    lab: "Laboratory",
    games: "Games",
    goals: "Goals",
    mentorMarketplace: "AI Mentors",
    courseMarketplace: "Course Market",
    skillGraph: "Skill Graph",
    portfolio: "My Portfolio",
    careerCenter: "Career Center",
    orgDashboard: "Organization",
    devPlatform: "Developers",
    monetization: "Subscription",
    logout: "Log Out"
  },
  nav: {
    core: "Core",
    dashboard: "Dashboard",
    learn: "Courses",
    paths: "Paths",
    lab: "Laboratory",
    flashcards: "Flashcards",
    goals: "Goals",
    openModule: "Open Module",
    marketplaces: "Marketplaces",
    mentorMarketplace: "AI Mentors",
    courseMarketplace: "Course Market",
    professional: "Professional",
    skillGraph: "Skill Graph",
    portfolio: "My Portfolio",
    careerCenter: "Career Center",
    institutions: "Institutions",
    orgDashboard: "Organization",
    devPlatform: "Developers",
    monetization: "Subscription",
    admin: "Admin",
    schoolManagement: "School Management"
  },
  dashboard: {
    title: "Main Dashboard",
    subtitle: "Track your progress, build your lifelong passport, and complete daily tasks.",
    activeGoals: "Active Goals",
    achievements: "Achievements",
    dailyDiscipline: "Daily Discipline",
    recommendedLessons: "Recommended Lessons",
    yourStats: "Your Stats"
  },
  mentorMarketplace: {
    title: "AI Mentor Marketplace",
    subtitle: "Create, customize, publish, and subscribe to premium AI educational mentors.",
    createMentor: "Create AI Mentor",
    creatorDashboard: "Creator Dashboard",
    allMentors: "All Mentors",
    searchPlaceholder: "Search by name, role, or subject...",
    mentorName: "Mentor Name",
    mentorRole: "Specialization (Role)",
    mentorBio: "Biography / Description",
    mentorPersona: "Teaching Style (Persona)",
    mentorSubject: "Subject",
    mentorPricing: "Monthly Price ($)",
    mentorRating: "Rating",
    subscribe: "Subscribe",
    subscribed: "Subscribed",
    unlocked: "Unlocked",
    free: "Free",
    premium: "Premium",
    myMentors: "My Mentors",
    popularMentors: "Popular Mentors",
    teachingStyle: "Teaching Style",
    monetizePrompt: "Monetize your knowledge",
    earnMessage: "Build your custom AI Mentor, share it with the community, and earn revenue sharing commissions."
  },
  courseMarketplace: {
    title: "Course Marketplace",
    subtitle: "Find high-quality courses designed by both experts and custom AI curriculum builders.",
    allCourses: "All Courses",
    createCourse: "Create Course",
    generateWithAI: "Generate with AI",
    enrolledCourses: "Enrolled Courses",
    duration: "Duration",
    lessons: "Lessons",
    difficulty: "Difficulty",
    price: "Price",
    enrollNow: "Enroll Now",
    enrolled: "Enrolled",
    courseCreator: "Creator",
    courseTitle: "Course Title",
    courseDesc: "Description",
    courseCategory: "Category",
    certificateAwarded: "Certificate upon completion"
  },
  skillGraph: {
    title: "Global Skill Graph",
    subtitle: "Visualize your multi-dimensional knowledge tree and discover personalized paths.",
    interactiveGraph: "Interactive Knowledge Map",
    completedSkills: "Completed Skills",
    inProgressSkills: "In-Progress Skills",
    lockedSkills: "Locked Skills",
    recommendedPath: "AI Recommended Next Step",
    recommendationMsg: "Based on your completed skills, we recommend mastering 'Machine Learning' next.",
    clickNode: "Click on any node to view detailed course prerequisites",
    totalUnlocked: "Total Unlocked Skills"
  },
  portfolio: {
    title: "Educational Portfolio & Passport",
    subtitle: "Your global digital education passport showcasing certificates, verified skills, and projects.",
    lifelongPassport: "Lifelong Digital Passport",
    experience: "Professional Experience",
    githubProjects: "GitHub Repositories",
    achievements: "Achievements",
    coursesCompleted: "Completed Courses",
    certificationBadge: "Certification Badges",
    viewPublicProfile: "View Public Profile",
    addExperience: "Add Experience",
    addProject: "Add Project",
    resumeTitle: "Resume Summary",
    skillsEndorsement: "Endorsed Skills"
  },
  career: {
    title: "Career & Opportunities Center",
    subtitle: "Connect your digital learning profile directly with active tech jobs and internships.",
    recommendedJobs: "Recommended Jobs",
    matchScore: "Match Score",
    internships: "Internships",
    applyNow: "Apply Now",
    applied: "Applied",
    company: "Company",
    location: "Location",
    requiredSkills: "Required Skills",
    jobSearchPlaceholder: "Search jobs by tech stack, role or keywords..."
  },
  orgDashboard: {
    title: "Organization Dashboard",
    subtitle: "Deploy training cohorts, track analytics, and monitor students, employees, or researchers.",
    schools: "Schools",
    universities: "Universities",
    companies: "Companies",
    studentManagement: "Student Management",
    cohortPerformance: "Cohort Performance",
    analytics: "Analytics & Reports",
    activeStudents: "Active Students",
    averageGrade: "Average Grade",
    cohortRetention: "Retention Rate",
    addStudent: "Enroll Student",
    inviteTeacher: "Invite Educator",
    aiCohortAnalysis: "AI Cohort Insight"
  },
  devPlatform: {
    title: "KrtLab Developer Platform",
    subtitle: "Incorporate KrtLab's modular AI tutor and grading capabilities into external systems using our SDK.",
    sdkDocs: "SDK & API Documentation",
    apiTokens: "API Authentication Tokens",
    generateToken: "Generate Token",
    apiTokenLabel: "Active API Secret Token",
    snippets: "Code Snippets",
    curlSnippet: "cURL CLI Request",
    nodeSnippet: "Node.js (TypeScript) SDK",
    pythonSnippet: "Python SDK Integration",
    integrationGuide: "Developers Integration Guide"
  },
  monetization: {
    title: "Plans & Monetization",
    subtitle: "Manage subscriptions, premium pricing plans, or monitor creator earnings and payouts.",
    freePlan: "Free Plan",
    premiumPlan: "Premium Plan ($15/mo)",
    enterprisePlan: "Enterprise Plan",
    creatorRevenue: "Creator Revenue Share",
    platformCommission: "Platform Commission",
    subscriptionPrice: "Subscription Price",
    upgradeNow: "Upgrade to Premium",
    currentPlan: "Current Tier",
    activePlan: "Active Plan",
    commissionRate: "Commission Split",
    analyticsRevenue: "Earning Analytics"
  }
};
