import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Search, Plus, Sparkles, BookOpen, Clock, Award, Star, Check, Bookmark, ShoppingBag, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface CourseModel {
  id: string;
  title: string;
  description: string;
  category: string;
  lessonsCount: number;
  durationHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  creator: string;
  isAIGenerated: boolean;
  isNew?: boolean;
}

const INITIAL_COURSES: CourseModel[] = [
  {
    id: 'c1',
    title: 'Python և AI Ակադեմիա',
    description: 'Զրոյից մինչև AI մոդելների ստեղծում։ Սովորեք Python-ի հիմունքները, Drizzle ORM-ը և Gemini API ինտեգրումը:',
    category: 'Programming',
    lessonsCount: 15,
    durationHours: 24,
    difficulty: 'Beginner',
    price: 0,
    rating: 4.9,
    creator: 'KrtLab AI Creator',
    isAIGenerated: true
  },
  {
    id: 'c2',
    title: 'Advanced Robotics & Control Systems',
    description: 'Մեքենայական ուսուցման կիրառությունը ռոբոտաշինության մեջ։ PID կարգավորիչներ, համակարգչային տեսողություն և ROS:',
    category: 'Robotics',
    lessonsCount: 22,
    durationHours: 40,
    difficulty: 'Advanced',
    price: 29.99,
    rating: 5.0,
    creator: 'Prof. Levon Sahakyan',
    isAIGenerated: false
  },
  {
    id: 'c3',
    title: 'Անգլերեն ՏՏ մասնագետների համար',
    description: 'Բարելավեք ձեր տեխնիկական անգլերենը, պատրաստվեք հարցազրույցների, սովորեք ճիշտ գրել դոկումենտացիա և նամակներ:',
    category: 'Languages',
    lessonsCount: 10,
    durationHours: 12,
    difficulty: 'Intermediate',
    price: 0,
    rating: 4.8,
    creator: 'Անի Սարգսյան',
    isAIGenerated: false
  },
  {
    id: 'c4',
    title: 'Digital Marketing & Growth Hacking',
    description: 'Ինչպես գեներացնել վաճառքներ և ապահովել լսարանի օրգանական աճ։ SEO, SMM և վերլուծական գործիքներ:',
    category: 'Business',
    lessonsCount: 12,
    durationHours: 18,
    difficulty: 'Intermediate',
    price: 19.99,
    rating: 4.7,
    creator: 'KrtLab AI Creator',
    isAIGenerated: true
  }
];

export const CourseMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<CourseModel[]>(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(['c1']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEnroll = (id: string, price: number) => {
    if (enrolledCourses.includes(id)) {
      toast.info('Դուք արդեն գրանցված եք այս դասընթացին:');
      return;
    }
    setEnrolledCourses(prev => [...prev, id]);
    toast.success(t('common.success'), { 
      description: price === 0 ? 'Գրանցումն անցավ հաջողությամբ' : `Դասընթացը գնվել է՝ $${price}` 
    });
  };

  const handleAIGenerateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Մուտքագրեք թեման:');
      return;
    }

    setIsGenerating(true);
    
    // Simulate complex API generation
    setTimeout(() => {
      const generated: CourseModel = {
        id: `ai_${Date.now()}`,
        title: `AI: ${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)}`,
        description: `ԱԲ կողմից ավտոմատ գեներացված ինտերակտիվ դասընթաց '${aiPrompt}' թեմայով: Ներառում է ինտերակտիվ լաբեր, քվիզներ և հավաստագիր:`,
        category: 'AI & Machine Learning',
        lessonsCount: Math.floor(Math.random() * 8) + 8,
        durationHours: Math.floor(Math.random() * 15) + 10,
        difficulty: aiDifficulty,
        price: 0,
        rating: 5.0,
        creator: 'KrtLab AI Engine',
        isAIGenerated: true,
        isNew: true
      };

      setCourses(prev => [generated, ...prev]);
      setEnrolledCourses(prev => [...prev, generated.id]);
      setIsGenerating(false);
      setAiPrompt('');
      toast.success('ԱԲ Դասընթացը հաջողությամբ գեներացվեց և ակտիվացավ ձեր էջում:', {
        icon: <Sparkles className="text-primary animate-pulse" />
      });
    }, 2500);
  };

  return (
    <div className="space-y-8" id="course-marketplace-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            {t('courseMarketplace.title')}
          </h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            {t('courseMarketplace.subtitle')}
          </p>
        </div>
      </div>

      {/* AI Generator Builder Card */}
      <div className="bg-gradient-brand text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl border border-primary/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-secondary animate-bounce" size={24} />
            <span className="text-sm font-black uppercase tracking-widest text-secondary">
              {t('courseMarketplace.courseCreator')}
            </span>
          </div>
          <h3 className="text-2xl font-black">Ստեղծեք սեփական ուսումնական պլանը ԱԲ-ով</h3>
          <p className="text-white/80 text-sm font-medium">
            Մուտքագրեք ցանկացած թեմա, և KrtLab AI Engine-ը կստեղծի ամբողջական կուրս՝ դասերով, քվիզներով և գործնական լաբորատորիաներով։
          </p>

          <form onSubmit={handleAIGenerateCourse} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              required
              disabled={isGenerating}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Օրինակ՝ Solidity Smart Contracts կամ Kubernetes հիմունքներ..."
              className="flex-1 px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl placeholder-white/50 text-white font-medium text-sm focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 outline-none transition-all"
            />
            <select
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value as any)}
              disabled={isGenerating}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white font-bold text-sm outline-none transition-all"
            >
              <option value="Beginner" className="text-slate-900">Beginner</option>
              <option value="Intermediate" className="text-slate-900">Intermediate</option>
              <option value="Advanced" className="text-slate-900">Advanced</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3.5 bg-secondary hover:bg-secondary/95 text-slate-950 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  <span>{t('courseMarketplace.generateWithAI')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Փնտրել դասընթացներ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Programming', 'Robotics', 'Languages', 'Business'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {cat === 'All' ? t('common.all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id);
          return (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {course.category}
                  </span>
                  {course.isAIGenerated && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Sparkles size={10} />
                      AI Co-pilot
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-slate-500 font-medium text-xs mb-4">
                  {t('courseMarketplace.courseCreator')}: <span className="text-slate-700 font-bold">{course.creator}</span>
                </p>

                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Course Metadata */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl text-center mb-6">
                  <div className="flex flex-col items-center justify-center">
                    <BookOpen size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-black text-slate-700">
                      {course.lessonsCount} {t('courseMarketplace.lessons')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Clock size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-black text-slate-700">
                      {course.durationHours} ժամ
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Award size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-black text-slate-700">
                      {course.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('courseMarketplace.price')}</span>
                  <span className="text-lg font-black text-slate-900">
                    {course.price === 0 ? t('mentorMarketplace.free') : `$${course.price}`}
                  </span>
                </div>

                <button
                  onClick={() => handleEnroll(course.id, course.price)}
                  disabled={isEnrolled}
                  className={`px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    isEnrolled
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <Check size={14} />
                      <span>{t('courseMarketplace.enrolled')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>{t('courseMarketplace.enrollNow')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
