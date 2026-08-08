import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { signInWithGoogle, logout, loginWithEmail, registerWithEmail } from "../../lib/firebase";
import { Logo } from "../../components/Logo";

export const OnboardingPage = ({ onComplete, user, onLogout }: {
  onComplete: (data: { name: string; school?: string; role: "admin" | "teacher" | "student" }) => void;
  user: any; onLogout: () => void;
}) => {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "teacher" | "student">("student");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleSignIn = async () => { try { await signInWithGoogle(); toast.success("Մուտքը հաջողվեց:"); } catch { toast.error("Google-ով մուտքի սխալ:"); } };
  const handleEmailAuth = async () => { try { isRegistering ? await registerWithEmail(email, password) : await loginWithEmail(email, password); toast.success(isRegistering ? "Գրանցումը հաջողվեց:" : "Մուտքը հաջողվեց:"); } catch (e: any) { toast.error(e.message || "Մուտքի սխալ:"); } };

  const wrap = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full -top-48 -left-48" />
      <div className="absolute w-[500px] h-[500px] bg-secondary/20 blur-[100px] rounded-full -bottom-48 -right-48" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3.5rem] p-12 space-y-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-500 font-medium text-center">Բարի գալուստ KrtLab Growth OS:</p>
        </div>
        {children}
      </motion.div>
    </div>
  );

  if (!user && !showEmailLogin) return wrap(
    <div className="space-y-6">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Մուտքագրեք ձեր անունը" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm" />
      <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Դպրոց / Հաստատություն" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm" />
      <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Դեր</label>
      <div className="grid grid-cols-3 gap-3">
        {(["student", "teacher", "admin"] as const).map((r) => (
          <button key={r} onClick={() => setSelectedRole(r)} className={cn("py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all", selectedRole === r ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>{r === "admin" ? "Ադմին" : r === "teacher" ? "Ուսուցիչ" : "Աշակերտ"}</button>
        ))}
      </div>
      <button onClick={() => name.trim() && onComplete({ name, school, role: selectedRole })} disabled={!name.trim()} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl disabled:opacity-50">Շարունակել</button>
      <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Կամ</span></div></div>
      <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all shadow-sm"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" /> Google</button>
      <button onClick={() => setShowEmailLogin(true)} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all shadow-sm"><Mail size={24} /> Email</button>
    </div>
  );

  if (!user && showEmailLogin) return wrap(
    <div className="space-y-6">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Էլ. փոստ" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent outline-none transition-all font-bold" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Գաղտնաբառ" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent outline-none transition-all font-bold" />
      <button onClick={handleEmailAuth} className="w-full bg-gradient-brand text-white py-5 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20">{isRegistering ? "Գրանցվել" : "Մուտք գործել"}</button>
      <div className="flex justify-between text-sm font-bold">
        <button onClick={() => setIsRegistering(!isRegistering)} className="text-accent hover:underline">{isRegistering ? "Արդեն ունե՞ք հաշիվ:" : "Չունե՞ք հաշիվ:"}</button>
        <button onClick={() => setShowEmailLogin(false)} className="text-slate-400 hover:underline">Հետ</button>
      </div>
    </div>
  );

  return wrap(
    <div className="space-y-6">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Մուտքագրեք ձեր անունը" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm" />
      <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Դպրոց / Հաստատություն" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm" />
      <div className="grid grid-cols-3 gap-3">
        {(["student", "teacher", "admin"] as const).map((r) => (
          <button key={r} onClick={() => setSelectedRole(r)} className={cn("py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all", selectedRole === r ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>{r === "admin" ? "Ադմին" : r === "teacher" ? "Ուսուցիչ" : "Աշակերտ"}</button>
        ))}
      </div>
      <button onClick={() => name.trim() && onComplete({ name, school, role: selectedRole })} disabled={!name.trim()} className="w-full bg-gradient-brand text-white py-6 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50">Պահպանել և Սկսել</button>
      <button onClick={onLogout} className="w-full text-slate-400 font-bold hover:underline">Դուրս գալ</button>
    </div>
  );
};
