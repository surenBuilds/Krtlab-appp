import { Outlet } from "react-router-dom";
import React, { useCallback } from "react";
import { Languages, Mic } from "lucide-react";
import { Sidebar } from "../features/navigation/Sidebar";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useUserProfile } from "../hooks/useUserProfile";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";

export const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { profile } = useUserProfile();
  const { language, setLanguage } = useTranslation();
  const isAdmin = profile?.role === "admin";
  const isTeacher = profile?.role === "teacher";

  const handleLogout = useCallback(async () => {
    try { const { logout } = await import("../lib/firebase"); await logout(); toast.success("Դուրս եկաք:"); } catch { toast.error("Սխալ:"); }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar isAdmin={isAdmin} isTeacher={isTeacher} isDemoMode={profile?.isDemoMode} onToggleDemoMode={() => {}} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col min-w-0">
        <ErrorBoundary section="Main Content">
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-900 hidden sm:block">KrtLab Growth OS</h1>
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={() => setLanguage(language === "hy" ? "en" : "hy")} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"><Languages size={16} /></button>
              <button onClick={() => toast.info("Voice coming soon")} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"><Mic size={16} /></button>
            </div>
          </header>
          <div className="p-8 max-w-7xl mx-auto w-full">{children || <Outlet />}</div>
        </ErrorBoundary>
      </main>
    </div>
  );
};
