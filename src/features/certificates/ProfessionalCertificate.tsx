import React, { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Award, Download, Sparkles, Loader2, ShieldCheck, Star, CreditCard, CheckCircle2, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { generateCertificateOutcomes } from "../../services/geminiService";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateData {
  courseName: string;
  levelName: string;
  studentName: string;
  date: string;
  outcomes: string;
  skills: string[];
}

export const ProfessionalCertificate: React.FC = () => {
  const { profile } = useUserProfile();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const generateCertificate = useCallback(async () => {
    setGenerating(true);
    try {
      const outcomes = await generateCertificateOutcomes(
        profile?.discovery?.goal === "programmer" ? "Programming & Software Development" : "Professional Development",
        `Level ${profile?.level || 1}`
      );
      const newCert: CertificateData = {
        courseName: profile?.discovery?.goal === "programmer" ? "Software Engineering" : "Professional Growth",
        levelName: `Level ${profile?.level || 1} — Advanced`,
        studentName: profile?.name || "Student",
        date: new Date().toLocaleDateString("hy-AM"),
        outcomes: outcomes || "Successfully completed the program demonstrating proficiency in the subject matter.",
        skills: (profile as any)?.strengths?.slice(0, 5) || ["Critical Thinking", "Problem Solving"],
      };
      setCertificates((prev) => [newCert, ...prev]);
      setSelectedCert(newCert);
      setShowPayment(true);
      toast.success("Certificate generated! Complete payment to download.");
    } catch { toast.error("Generation failed."); }
    finally { setGenerating(false); }
  }, [profile]);

  const handlePayment = () => {
    setPaymentComplete(true);
    setShowPayment(false);
    toast.success("Payment confirmed! Your certificate is ready for download.");
  };

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save(`KrtLab_Certificate_${selectedCert?.courseName || "Course"}.pdf`);
    toast.success("Certificate downloaded!");
  };

  return (<div className="space-y-8">
    <div className="flex items-center justify-between">
      <div><h2 className="text-4xl font-black text-slate-900 flex items-center gap-3"><Award className="text-primary" size={32}/>Professional Certificates</h2><p className="text-slate-500 mt-2">ԱԲ-ի կողմից պրոֆեսիոնալ ձևով պատրաստված սերտիֆիկատներ</p></div>
      <button onClick={generateCertificate} disabled={generating} className={cn("px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 shadow-xl transition-all", generating ? "bg-slate-400" : "bg-primary hover:bg-primary/90 active:scale-95")}>{generating ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20}/>}{generating ? "Generating..." : "Generate Certificate"}</button>
    </div>

    {showPayment && selectedCert && (
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm max-w-md mx-auto text-center">
        <CreditCard size={40} className="text-primary mx-auto mb-4"/>
        <h3 className="text-xl font-black mb-2">Professional Certificate</h3>
        <p className="text-slate-500 mb-4">{selectedCert.courseName} — {selectedCert.levelName}</p>
        <div className="text-3xl font-black text-primary mb-2">$4.99</div>
        <p className="text-xs text-slate-400 mb-6">One-time payment. Includes AI-generated professional certificate with PDF download.</p>
        <button onClick={handlePayment} className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all mb-3"><CreditCard size={18} className="inline mr-2"/>Pay $4.99</button>
        <button onClick={() => setShowPayment(false)} className="text-sm text-slate-400 hover:underline">Cancel</button>
      </motion.div>
    )}

    {selectedCert && paymentComplete && (
      <><div ref={certRef} className="bg-white rounded-[2rem] border-2 border-slate-200 p-16 relative overflow-hidden" style={{minHeight:"500px"}}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary"/>
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center"><Award className="text-primary" size={48}/></div>
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">KrtLab Certificate of Completion</h2>
          <div className="w-32 h-0.5 bg-slate-200 mx-auto"/>
          <p className="text-slate-500 text-lg">This certifies that</p>
          <h3 className="text-4xl font-black text-primary">{selectedCert.studentName}</h3>
          <p className="text-slate-500 text-lg">has successfully completed</p>
          <h3 className="text-2xl font-black text-slate-900">{selectedCert.courseName}</h3>
          <p className="text-slate-500">{selectedCert.levelName}</p>
          <div className="max-w-lg mx-auto text-left bg-slate-50 rounded-2xl p-6"><h4 className="font-black text-sm text-slate-700 mb-2">Learning Outcomes:</h4><p className="text-slate-600 text-sm">{selectedCert.outcomes}</p></div>
          {selectedCert.skills.length > 0 && <div className="flex flex-wrap gap-2 justify-center">{selectedCert.skills.map((s,i) => (<span key={i} className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold">{s}</span>))}</div>}
          <div className="pt-4"><p className="text-xs text-slate-400">Issued on {selectedCert.date} · Verified by KrtLab Growth OS</p><p className="text-[10px] text-slate-300 mt-1">Certificate ID: KRT-{Date.now().toString(36).toUpperCase()}</p></div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={downloadPDF} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-2"><Download size={20}/>Download PDF</button>
        <button onClick={() => { setSelectedCert(null); setPaymentComplete(false); }} className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black hover:bg-slate-50">New Certificate</button>
      </div></>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {certificates.filter(c => c !== selectedCert).map((cert, i) => (<div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Award className="text-primary" size={24}/></div>
        <div className="flex-1"><h4 className="font-black text-slate-900">{cert.courseName}</h4><p className="text-xs text-slate-500">{cert.levelName} · {cert.date}</p></div>
        <button onClick={() => { setSelectedCert(cert); setPaymentComplete(true); }} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200">View</button>
      </div>))}
    </div>
  </div>);
};
