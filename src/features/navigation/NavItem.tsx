import React from "react";
import { cn } from "../../lib/utils";

export const NavItem = ({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) => (
  <button onClick={onClick} className={cn(
    "w-full flex items-center gap-3 px-5 py-2.5 rounded-xl font-black transition-all relative group text-xs cursor-pointer",
    active ? "bg-slate-100 text-slate-900 border-l-4 border-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  )}>
    <span className={cn("transition-transform duration-300", active ? "scale-110 text-primary" : "group-hover:scale-110")}>{icon}</span>
    <span className="tracking-tight">{label}</span>
  </button>
);

export const MobileNavItem = ({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) => (
  <button onClick={onClick} className={cn(
    "w-full flex items-center gap-4 py-2.5 px-4 rounded-xl font-black transition-all text-xs cursor-pointer",
    active ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
  )}>
    <span className={cn("transition-transform duration-300", active ? "scale-110" : "")}>{icon}</span>
    <span className="tracking-tight">{label}</span>
  </button>
);
