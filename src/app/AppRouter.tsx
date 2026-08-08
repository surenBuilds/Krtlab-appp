import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";
import { GrowthDashboard } from "../features/dashboard/GrowthDashboard";
import { GrowthAIMentor } from "../features/mentor/GrowthAIMentor";
import { GrowthSkillGraph } from "../features/skills/GrowthSkillGraph";
import { useUserProfile } from "../hooks/useUserProfile";
import { Toaster } from "sonner";

const GoalsSection = lazy(() => import("../components/GoalsSection").then(m=>({default:m.GoalsSection})));
const LearningPaths = lazy(() => import("../components/LearningPaths").then(m=>({default:m.LearningPaths})));
const FlashcardSystem = lazy(() => import("../components/FlashcardSystem").then(m=>({default:m.FlashcardSystem})));
const PracticeLab = lazy(() => import("../components/PracticeLab").then(m=>({default:m.PracticeLab})));
const GamesSection = lazy(() => import("../components/GamesSection").then(m=>({default:m.GamesSection})));
const LanguageModule = lazy(() => import("../components/LanguageModule").then(m=>({default:m.LanguageModule})));
const DisciplineSystem = lazy(() => import("../components/DisciplineSystem").then(m=>({default:m.DisciplineSystem})));
const PersonalLearningProfile = lazy(() => import("../components/PersonalLearningProfile").then(m=>({default:m.PersonalLearningProfile})));
const CareerCenter = lazy(() => import("../components/CareerCenter").then(m=>({default:m.CareerCenter})));
const CourseMarketplace = lazy(() => import("../components/CourseMarketplace").then(m=>({default:m.CourseMarketplace})));
const MentorMarketplace = lazy(() => import("../components/MentorMarketplace").then(m=>({default:m.MentorMarketplace})));
const OrganizationDashboard = lazy(() => import("../components/OrganizationDashboard").then(m=>({default:m.OrganizationDashboard})));
const DeveloperPlatform = lazy(() => import("../components/DeveloperPlatform").then(m=>({default:m.DeveloperPlatform})));
const MonetizationSystem = lazy(() => import("../components/MonetizationSystem").then(m=>({default:m.MonetizationSystem})));
const CommunitySection = lazy(() => import("../components/CommunitySection").then(m=>({default:m.CommunitySection})));
const GameCreator = lazy(() => import("../components/GameCreator").then(m=>({default:m.GameCreator})));

function LazyFallback(){return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/></div>}
function LazyRoute({children}:{children:React.ReactNode}){return <Suspense fallback={<LazyFallback/>}>{children}</Suspense>}

function ProtectedRoute({children}:{children:React.ReactNode}){const{profile,loading}=useUserProfile();if(loading)return<LazyFallback/>;if(!profile?.name)return<Navigate to="/onboarding" replace/>;return<>{children}</>}

function OnboardingRoute(){const{profile,user,loading,updateProfile}=useUserProfile();const hl=async()=>{try{const{logout}=await import("../lib/firebase");await logout()}catch{}};if(loading)return<LazyFallback/>;if(profile?.name)return<Navigate to="/dashboard" replace/>;return<OnboardingPage onComplete={d=>updateProfile(d)} user={user} onLogout={hl}/>}

function FlashcardWrapper(){const{profile,updateProfile}=useUserProfile();const ha=(term:string,def:string,catId:string,lvl:string)=>{updateProfile({flashcards:[...(profile?.flashcards||[]),{id:Math.random().toString(36).substr(2,9),term,definition:def,categoryId:catId,subcategoryId:"general",createdAt:new Date().toISOString(),nextReview:new Date().toISOString(),interval:0,repetitionCount:0,easeFactor:2.5,level:lvl as any}]})};return <FlashcardSystem cards={profile?.flashcards||[]} onAddCard={ha} onDeleteCard={id=>updateProfile({flashcards:(profile?.flashcards||[]).filter(c=>c.id!==id)})} onUpdateSRS={()=>{}}/>}
function LangWrapper(){return <LanguageModule languageId="english" languageTitle="English" onExit={()=>window.history.back()}/>}
function DisciplineWrapper(){const{profile}=useUserProfile();if(!profile)return null;return <DisciplineSystem daysCount={profile.discipline?.daysCount||0} streak={profile.streak||0} tasks={profile.discipline?.dailyTasks||[]} onToggleTask={()=>{}} xp={profile.xp||0} level={profile.level||1}/>}

const router = createBrowserRouter([{path:"/",element:<AppShell/>,children:[
  {index:true,element:<Navigate to="/dashboard" replace/>},
  {path:"dashboard",element:<ProtectedRoute><AppLayout><GrowthDashboard/></AppLayout></ProtectedRoute>},
  {path:"mentor",element:<ProtectedRoute><AppLayout><GrowthAIMentor isOpen={true} onClose={()=>window.history.back()}/></AppLayout></ProtectedRoute>},
  {path:"goals",element:<ProtectedRoute><AppLayout><LazyRoute><GoalsSection/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"learn",element:<ProtectedRoute><AppLayout><LazyRoute><div className="p-8 text-center"><h2 className="text-2xl font-black">Learning Center</h2></div></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"paths",element:<ProtectedRoute><AppLayout><LazyRoute><LearningPaths/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"lab",element:<ProtectedRoute><AppLayout><LazyRoute><PracticeLab/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"flashcards",element:<ProtectedRoute><AppLayout><LazyRoute><FlashcardWrapper/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"games",element:<ProtectedRoute><AppLayout><LazyRoute><GamesSection/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"languages",element:<ProtectedRoute><AppLayout><LazyRoute><LangWrapper/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"skills",element:<ProtectedRoute><AppLayout><GrowthSkillGraph/></AppLayout></ProtectedRoute>},
  {path:"discipline",element:<ProtectedRoute><AppLayout><LazyRoute><DisciplineWrapper/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"career",element:<ProtectedRoute><AppLayout><LazyRoute><CareerCenter/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"portfolio",element:<ProtectedRoute><AppLayout><LazyRoute><PersonalLearningProfile/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"opportunities",element:<ProtectedRoute><AppLayout><LazyRoute><CareerCenter/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"courses",element:<ProtectedRoute><AppLayout><LazyRoute><CourseMarketplace/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"mentors",element:<ProtectedRoute><AppLayout><LazyRoute><MentorMarketplace/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"community",element:<ProtectedRoute><AppLayout><LazyRoute><CommunitySection/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"organization",element:<ProtectedRoute><AppLayout><LazyRoute><OrganizationDashboard/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"developers",element:<ProtectedRoute><AppLayout><LazyRoute><DeveloperPlatform/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"monetization",element:<ProtectedRoute><AppLayout><LazyRoute><MonetizationSystem/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"profile",element:<ProtectedRoute><AppLayout><LazyRoute><PersonalLearningProfile/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"timeline",element:<ProtectedRoute><AppLayout><LazyRoute><div className="p-8"><h2 className="text-2xl font-black">Timeline</h2></div></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"admin/games",element:<ProtectedRoute><AppLayout><LazyRoute><GameCreator/></LazyRoute></AppLayout></ProtectedRoute>},
  {path:"onboarding",element:<OnboardingRoute/>},
  {path:"*",element:<Navigate to="/dashboard" replace/>},
]}]);

function AppShell(){return<><Toaster position="top-center" richColors/><Outlet/></>}
export function AppRouter(){return<RouterProvider router={router}/>}