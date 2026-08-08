import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, MessageSquare, BrainCircuit, Menu, X, Map, Target, RefreshCcw, LogOut, Wallet, Briefcase, Cpu, FlaskConical, Building2, Wand2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Logo } from "../../components/Logo";
import { NavItem } from "./NavItem";
import { useTranslation } from "../../hooks/useTranslation";

interface SidebarProps { isAdmin: boolean; isTeacher: boolean; isDemoMode?: boolean; onToggleDemoMode?: () => void; onLogout: () => void; disabled?: boolean; }

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin, isTeacher, isDemoMode, onToggleDemoMode, onLogout, disabled }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + "/");
  const go = (p: string) => { navigate(p); setIsMobileMenuOpen(false); };

  const SectionLabel = ({ label }: { label: string }) => <div className="px-3 py-1 pt-3 text-[9px] font-black tracking-widest text-slate-400 uppercase">{label}</div>;

  return (<>
    <button className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-2xl shadow-lg border border-slate-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />}
    <aside className={cn("hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen transition-opacity", disabled && "opacity-50 pointer-events-none grayscale")}>
      <div className="p-8"><Logo size="md" /></div>
      <nav className="flex-1 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-none px-4 space-y-1.5 pb-6">
        <SectionLabel label={t("nav.core")} />
        <NavItem active={isActive("/dashboard")} onClick={() => go("/dashboard")} icon={<LayoutDashboard size={16} />} label={t("nav.dashboard")} />
        <NavItem active={isActive("/learn")} onClick={() => go("/learn")} icon={<BookOpen size={16} />} label={t("nav.learn")} />
        <NavItem active={isActive("/paths")} onClick={() => go("/paths")} icon={<Map size={16} />} label={t("nav.paths")} />
        <NavItem active={isActive("/lab")} onClick={() => go("/lab")} icon={<FlaskConical size={16} />} label={t("nav.lab")} />
        <NavItem active={isActive("/flashcards")} onClick={() => go("/flashcards")} icon={<BrainCircuit size={16} />} label={t("nav.flashcards")} />
        <NavItem active={isActive("/goals")} onClick={() => go("/goals")} icon={<Target size={16} />} label={t("nav.goals")} />
        <NavItem active={isActive("/mentor")} onClick={() => go("/mentor")} icon={<MessageSquare size={16} />} label="AI Mentor" />
        <SectionLabel label={t("nav.professional")} />
        <NavItem active={isActive("/skills")} onClick={() => go("/skills")} icon={<BrainCircuit size={16} />} label={t("nav.skillGraph")} />
        <NavItem active={isActive("/portfolio")} onClick={() => go("/portfolio")} icon={<Briefcase size={16} />} label={t("nav.portfolio")} />
        <NavItem active={isActive("/career")} onClick={() => go("/career")} icon={<Briefcase size={16} />} label={t("nav.careerCenter")} />
        <NavItem active={isActive("/discipline")} onClick={() => go("/discipline")} icon={<Target size={16} />} label="Discipline" />
        <NavItem active={isActive("/opportunities")} onClick={() => go("/opportunities")} icon={<Briefcase size={16} />} label="Opportunities" />
        <SectionLabel label={t("nav.marketplaces")} />
        <NavItem active={isActive("/mentors")} onClick={() => go("/mentors")} icon={<MessageSquare size={16} />} label={t("nav.mentorMarketplace")} />
        <NavItem active={isActive("/courses")} onClick={() => go("/courses")} icon={<BookOpen size={16} />} label={t("nav.courseMarketplace")} />
        <SectionLabel label={t("nav.institutions")} />
        <NavItem active={isActive("/organization")} onClick={() => go("/organization")} icon={<Building2 size={16} />} label={t("nav.orgDashboard")} />
        <NavItem active={isActive("/developers")} onClick={() => go("/developers")} icon={<Cpu size={16} />} label={t("nav.devPlatform")} />
        <NavItem active={isActive("/monetization")} onClick={() => go("/monetization")} icon={<Wallet size={16} />} label={t("nav.monetization")} />
        {(isAdmin || isTeacher) && (<><SectionLabel label={t("nav.admin")} /><NavItem active={isActive("/organization")} onClick={() => go("/organization")} icon={<Building2 size={16} />} label={t("nav.schoolManagement")} /></>)}
        {isAdmin && <NavItem active={isActive("/admin/games")} onClick={() => go("/admin/games")} icon={<Wand2 size={16} />} label="Game Creator" />}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-6 py-5 rounded-[1.5rem] font-black transition-all text-red-500 hover:bg-red-50 mt-4"><LogOut size={20} /><span>Դուրս գալ</span></button>
      </nav>
      {(isAdmin || isTeacher) && onToggleDemoMode && <div className="p-6 border-t border-slate-100">
        <button onClick={onToggleDemoMode} className={cn("flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all group w-full", isDemoMode ? "bg-amber-500/10 border-amber-500 text-amber-600" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200")}>
          <div className="flex items-center gap-2"><RefreshCcw size={18} /><span className="text-xs font-black uppercase tracking-widest">Demo</span></div>
          <div className={cn("w-8 h-4 rounded-full relative transition-colors", isDemoMode ? "bg-amber-500" : "bg-slate-300")}><div className={cn("w-3.5 h-3.5 rounded-full absolute top-0.5 bg-white transition-all shadow", isDemoMode ? "left-4" : "left-0.5")} /></div>
        </button>
      </div>}
    </aside>
  </>);
};
