import { useState, useCallback, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateLessonContent } from '../services/geminiService';
import { CATEGORIES } from '../data/categories';
import { PracticalTask, UniversalGame } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Lesson {
  title: string;
  topicId?: string;
  topicName?: string;
  orderIndex?: number;
  introduction: string;
  keyConcepts: string[];
  detailedExplanation: string;
  examples: string[];
  exercises: string[];
  miniSummary: string;
  recommendedReading: Array<{
    title: string;
    author: string;
    description: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  practiceTask: PracticalTask;
  games: UniversalGame[];
  linkedTaskId?: {
    categoryId: string;
    subfieldId: string;
    level: number;
  };
  requiredScore?: number;
}

export interface LessonState {
  lessonId: string;
  content: Lesson | null;
  isLoading: boolean;
  isGenerated: boolean;
  isLocked: boolean;
  error: string | null;
}

// Demo lessons for instant loading (Production Demo Mode)
const DEMO_LESSONS: Record<string, Lesson> = {
  "entrepreneurship_1": {
    title: "Ձեռնարկատիրության հիմունքները",
    introduction: "Բարի գալուստ ձեռնարկատիրության աշխարհ: Այս դասը ձեզ կծանոթացնի այն հիմնական սկզբունքներին, որոնք անհրաժեշտ են սեփական գործը սկսելու համար:",
    keyConcepts: [
      "Ձեռնարկատիրական մտածելակերպ",
      "Արժեքի ստեղծում",
      "Ռիսկերի կառավարում"
    ],
    detailedExplanation: "Ձեռնարկատիրությունը գործընթաց է, որի միջոցով անհատները կամ թիմերը բացահայտում են հնարավորություններ, հավաքագրում ռեսուրսներ և ստեղծում նորարարական լուծումներ: Այն պահանջում է ստեղծագործական մոտեցում, ռիսկի դիմելու պատրաստակամություն և համառություն: Հաջողակ ձեռնարկատերերը կենտրոնանում են ոչ թե շահույթի, այլ հաճախորդի խնդիրը լուծելու վրա:",
    examples: [
      "Airbnb-ի ստեղծումը. հիմնադիրները սկսեցին իրենց բնակարանում օդային ներքնակներ վարձակալելուց:",
      "Uber-ի մոդելը. տրանսպորտային խնդրի լուծում տեխնոլոգիայի միջոցով:"
    ],
    exercises: [
      "Բացահայտեք մեկ խնդիր ձեր շրջապատում և առաջարկեք լուծում:",
      "Կազմեք ձեր գաղափարի առաջին քայլերի պլանը:"
    ],
    miniSummary: "Ձեռնարկատիրությունը խնդիրներ լուծելու և արժեք ստեղծելու արվեստն է:",
    recommendedReading: [
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        description: "Methodologies for developing businesses and products through validated learning."
      }
    ],
    quiz: [
      {
        question: "Ո՞րն է ձեռնարկատիրության հիմնական նպատակը:",
        options: ["Միայն փող աշխատելը", "Խնդիրներ լուծելը և արժեք ստեղծելը", "Աշխատանքից խուսափելը", "Գովազդ անելը"],
        correctAnswer: 1
      }
    ],
    practiceTask: {
      id: 'entre-1',
      title: 'Ձեռնարկատիրական գաղափար',
      scenario: 'Մտածեք մի խնդիր, որը կա ձեր շրջապատում:',
      context: 'Տեղական շուկայի հետազոտություն',
      role: 'Սկսնակ ձեռնարկատեր',
      mission: 'Բացահայտել իրական խնդիր և առաջարկել նորարար լուծում',
      constraints: ['Իրատեսականություն', 'Բյուջետային սահմանափակում'],
      instructions: '1. Գտեք խնդիրը\n2. Առաջարկեք լուծում',
      deliverable: 'Լուծման նկարագրություն',
      evaluationCriteria: 'Նորարարություն և իրատեսություն'
    },
    games: [],
    linkedTaskId: {
      categoryId: 'business',
      subfieldId: 'entrepreneurship',
      level: 1
    },
    requiredScore: 100
  },
  "marketing_1": {
    title: "Մարքեթինգի հիմունքները",
    introduction: "Մարքեթինգը բիզնեսի սիրտն է: Այս դասում մենք կուսումնասիրենք, թե ինչպես են ընկերությունները հաղորդակցվում իրենց հաճախորդների հետ:",
    keyConcepts: [
      "4P մոդել (Product, Price, Place, Promotion)",
      "Թիրախային լսարան",
      "Բրենդինգ"
    ],
    detailedExplanation: "Մարքեթինգը պարզապես գովազդ չէ: Այն սկսվում է շուկայի հետազոտությունից և հաճախորդի կարիքների բացահայտումից: Հիմնական նպատակն է ստեղծել ամուր հարաբերություններ հաճախորդների հետ, որոնք օգուտ կբերեն և՛ նրանց, և՛ կազմակերպությանը: Ժամանակակից մարքեթինգը հիմնված է տվյալների և հոգեբանության վրա:",
    examples: [
      "Coca-Cola-ի բրենդինգը. զգացմունքային կապի ստեղծում սպառողի հետ:",
      "Apple-ի մարքեթինգային ռազմավարությունը. կենտրոնացում դիզայնի և պարզության վրա:"
    ],
    exercises: [
      "Որոշեք ձեր սիրելի բրենդի թիրախային լսարանը:",
      "Ստեղծեք փոքրիկ գովազդային հաղորդագրություն նոր ապրանքի համար:"
    ],
    miniSummary: "Մարքեթինգը հաճախորդի համար արժեք ստեղծելու և մատուցելու գործընթացն է:",
    recommendedReading: [
      {
        title: "Principles of Marketing",
        author: "Philip Kotler",
        description: "Fundamental concepts in modern marketing."
      }
    ],
    quiz: [
      {
        question: "Ի՞նչ է մարքեթինգը առաջին հերթին:",
        options: ["Գովազդ հեռուստացույցով", "Արժեքի ստեղծում և մատուցում", "Մարդկանց խաբելը", "Ապրանքի գինը բարձրացնելը"],
        correctAnswer: 1
      }
    ],
    practiceTask: {
      id: 'mark-1',
      title: 'Թիրախային լսարան',
      scenario: 'Ընտրեք ձեր սիրելի բրենդը:',
      context: 'Շուկայի սեգմենտավորում',
      role: 'Մարքեթոլոգ',
      mission: 'Սահմանել բրենդի թիրախային սեգմենտը',
      constraints: ['Հստակություն', 'Չափելիություն'],
      instructions: '1. Ուսումնասիրեք բրենդը\n2. Որոշեք թիրախը',
      deliverable: 'Լսարանի նկարագրություն',
      evaluationCriteria: 'Ճշգրտություն'
    },
    games: [],
    linkedTaskId: {
      categoryId: 'business',
      subfieldId: 'marketing',
      level: 1
    },
    requiredScore: 100
  },
  "sales_1": {
    title: "Վաճառքի արվեստը",
    introduction: "Վաճառքը հմտություն է, որը պետք է յուրաքանչյուրին: Այս դասում մենք կսովորենք արդյունավետ հաղորդակցության գաղտնիքները:",
    keyConcepts: [
      "Ակտիվ լսում",
      "Առարկությունների հաղթահարում",
      "Գործարքի փակում"
    ],
    detailedExplanation: "Վաճառքը բիզնեսի շարժիչ ուժն է: Այն սկսվում է վստահություն կառուցելուց: Լավ վաճառողը ոչ թե շատ է խոսում, այլ ճիշտ հարցեր է տալիս՝ հասկանալու համար հաճախորդի իրական ցավը: Վաճառքի գործընթացը ներառում է որոնում, մոտեցում, ներկայացում, առարկությունների հաղթահարում և գործարքի փակում:",
    examples: [
      "SPIN տեխնիկայի կիրառումը. հարցերի միջոցով հաճախորդի կարիքի բացահայտում:",
      "Առարկությունների հաղթահարում. 'Գինը բարձր է' փաստարկի վերածումը արժեքի բացատրության:"
    ],
    exercises: [
      "Փորձեք վաճառել ձեր գրիչը ընկերոջը՝ օգտագործելով ակտիվ լսում:",
      "Կազմեք 3 հարց, որոնք կօգնեն հասկանալ հաճախորդի կարիքը:"
    ],
    miniSummary: "Վաճառքը հաճախորդին օգնելն է՝ կայացնելու իր համար լավագույն որոշումը:",
    recommendedReading: [
      {
        title: "SPIN Selling",
        author: "Neil Rackham",
        description: "Classic guide to professional sales techniques."
      }
    ],
    quiz: [
      {
        question: "Ո՞րն է լավ վաճառողի ամենակարևոր հմտությունը:",
        options: ["Շատ արագ խոսելը", "Հաճախորդին լսելը և հասկանալը", "Ցածր գին առաջարկելը", "Գեղեցիկ հագնվելը"],
        correctAnswer: 1
      }
    ],
    practiceTask: {
      id: 'sales-1',
      title: 'Վաճառքի փորձ',
      scenario: 'Փորձեք վաճառել մի իր ձեր սենյակից:',
      context: 'Անհատական վաճառք',
      role: 'Վաճառքի մասնագետ',
      mission: 'Ներկայացնել ապրանքի օգուտները հաճախորդին',
      constraints: ['Համոզիչ լինելը', 'Էթիկա'],
      instructions: '1. Նկարագրեք իրը\n2. Գտեք օգուտը',
      deliverable: 'Վաճառքի տեքստ',
      evaluationCriteria: 'Համոզիչ լինելը'
    },
    games: [],
    linkedTaskId: {
      categoryId: 'business',
      subfieldId: 'sales',
      level: 1
    },
    requiredScore: 100
  }
};

export const useLessonStore = () => {
  const [lessons, setLessons] = useState<Record<string, LessonState>>({});
  const lessonsRef = useRef(lessons);
  lessonsRef.current = lessons;
  const loadingRef = useRef<Record<string, boolean>>({});

  const fetchLesson = useCallback(async (
    categoryId: string, 
    subfieldId: string, 
    levelId: number,
    forceRefresh = false
  ) => {
    const lessonId = `${subfieldId}_${levelId}`;
    
    // DEBUG LOGGING (TEMP)
    console.log("Course (subfieldId):", subfieldId);
    console.log("Level:", levelId);
    console.log("LessonKey:", lessonId);
    
    // 1. Check if already in state and locked (CRITICAL FIX: Prevent regeneration)
    if (!forceRefresh && lessonsRef.current[lessonId]?.isLocked && lessonsRef.current[lessonId]?.content) {
      return lessonsRef.current[lessonId];
    }

    // Prevent duplicate API calls
    if (loadingRef.current[lessonId] && !forceRefresh) return;
    loadingRef.current[lessonId] = true;

    setLessons(prev => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] || { lessonId, content: null, isGenerated: false, isLocked: false, error: null }),
        isLoading: true,
        error: null
      }
    }));

    try {
      // 2. Check Demo Data (Instant Load)
      if (DEMO_LESSONS[lessonId] && !forceRefresh) {
        const demoLesson = {
          lessonId,
          content: DEMO_LESSONS[lessonId],
          isLoading: false,
          isGenerated: true,
          isLocked: true,
          error: null
        };
        setLessons(prev => ({ ...prev, [lessonId]: demoLesson }));
        loadingRef.current[lessonId] = false;
        return demoLesson;
      }

      // 3. Check LocalStorage (Fast Load)
      const cached = localStorage.getItem(lessonId);
      if (cached && !forceRefresh) {
        try {
          const parsed = JSON.parse(cached);
          const state = {
            lessonId,
            content: parsed,
            isLoading: false,
            isGenerated: true,
            isLocked: true,
            error: null
          };
          setLessons(prev => ({ ...prev, [lessonId]: state }));
          loadingRef.current[lessonId] = false;
          return state;
        } catch (e) {
          localStorage.removeItem(lessonId);
        }
      }

      // 4. Check Firestore (Production Persistence)
      if (auth.currentUser && !forceRefresh) {
        const docRef = doc(db, 'lessons', lessonId);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Lesson;
            localStorage.setItem(lessonId, JSON.stringify(data));
            const state = {
              lessonId,
              content: data,
              isLoading: false,
              isGenerated: true,
              isLocked: true,
              error: null
            };
            setLessons(prev => ({ ...prev, [lessonId]: state }));
            loadingRef.current[lessonId] = false;
            return state;
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `lessons/${lessonId}`);
        }
      }

      // 5. Generate with AI (Optimized Timeout)
      const category = CATEGORIES.find(c => c.id === categoryId);
      const subfield = category?.subfields?.find(s => s.id === subfieldId);
      const literature = subfield?.recommendedLiterature;
      const currentTopic = subfield?.courseTopics?.[levelId - 1];

      // 120-second timeout for complex generation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 120000)
      );

      const fetchWithRetry = async (retries = 2): Promise<Lesson> => {
        try {
          return await generateLessonContent(
            category?.title || categoryId,
            subfield?.title || subfieldId,
            levelId,
            literature,
            [],
            currentTopic,
            levelId
          );
        } catch (err) {
          if (retries > 0) {
            console.warn(`Generation failed, retrying... (${retries} left)`);
            return fetchWithRetry(retries - 1);
          }
          throw err;
        }
      };

      const content = await Promise.race([fetchWithRetry(), timeoutPromise]) as Lesson;

      // 6. Save to Cache & Lock
      localStorage.setItem(lessonId, JSON.stringify(content));
      if (auth.currentUser) {
        setDoc(doc(db, 'lessons', lessonId), content).catch(error => {
          handleFirestoreError(error, OperationType.WRITE, `lessons/${lessonId}`);
        });
      }

      const finalState = {
        lessonId,
        content,
        isLoading: false,
        isGenerated: true,
        isLocked: true,
        error: null
      };

      setLessons(prev => ({ ...prev, [lessonId]: finalState }));
      loadingRef.current[lessonId] = false;
      return finalState;

    } catch (err: any) {
      console.error("Lesson fetch error:", err);
      
      // SILENT FALLBACK (Requirement 1: No error messages)
      const fallbackState = {
        lessonId,
        content: lessons[lessonId]?.content || null,
        isLoading: false,
        isGenerated: false,
        isLocked: false,
        error: err.message === "TIMEOUT" ? "Դասի ստեղծումը տևում է սովորականից երկար: Խնդրում ենք փորձել մի փոքր ուշ:" : "Դասը ժամանակավորապես հասանելի չէ:"
      };
      setLessons(prev => ({ ...prev, [lessonId]: fallbackState }));
      loadingRef.current[lessonId] = false;
      return fallbackState;
    }
  }, []);

  const preGenerate = useCallback((categoryId: string, subfieldId: string, levelId: number) => {
    fetchLesson(categoryId, subfieldId, levelId);
  }, [fetchLesson]);

  return {
    lessons,
    fetchLesson,
    preGenerate
  };
};
