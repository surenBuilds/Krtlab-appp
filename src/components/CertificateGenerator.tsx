import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Award, Download, ShieldCheck, Loader2 } from 'lucide-react';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { isQuotaError, generateCertificateOutcomes } from '../services/geminiService';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { toast } from 'sonner';
import { requestCertificate, CertificateRequestResult } from '../services/certificateService';

interface CertificateProps {
  profile: UserProfile;
  courseName: string;
  levelName: string;
  completionDate: string;
  skillId: string;
  onClose: () => void;
}

export const CertificateGenerator: React.FC<CertificateProps> = ({ 
  profile, 
  courseName, 
  levelName, 
  completionDate,
  skillId,
  onClose 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [certRequest, setCertRequest] = useState<CertificateRequestResult | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // This PDF is a free, unofficial achievement record — not a paid Verified
  // Certificate. It never claims verification status or a fake serial number.
  const handleRequestOfficialCertificate = async () => {
    setIsRequesting(true);
    try {
      const result = await requestCertificate(skillId);
      setCertRequest(result);
      if (result.paymentAvailable && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.info('Վճարային համակարգը դեռ միացված չէ', {
          description: result.message || 'Official Verified Certificate-ը շուտով հասանելի կլինի։'
        });
      }
    } catch (err: any) {
      toast.error('Չհաջողվեց հայցել հավաստագիրը', { description: err.message });
    } finally {
      setIsRequesting(false);
    }
  };

  // Generate AI Learning Outcomes
  React.useEffect(() => {
    const generateOutcomes = async () => {
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          const outcomesText = await generateCertificateOutcomes(courseName, levelName);
          setLearningOutcomes(outcomesText || 'Successfully demonstrated comprehensive knowledge and practical application of core principles within the subject area.');
          setIsAiLoading(false);
          break;
        } catch (error: any) {
          if (isQuotaError(error)) {
            retryCount++;
            if (retryCount <= maxRetries) {
              const waitTime = Math.pow(2, retryCount) * 2000;
              console.warn(`Quota exceeded in Certificate Generator. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          console.error("AI Generation failed:", error);
          setLearningOutcomes('Successfully demonstrated comprehensive knowledge and practical application of core principles within the subject area.');
          setIsAiLoading(false);
          break;
        }
      }
    };

    generateOutcomes();
  }, [courseName, levelName]);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const jsPDFConstructor = (jspdf as any).jsPDF || jspdf;
      const pdf = new jsPDFConstructor({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`KrtLab_Certificate_${profile.name.replace(/\s+/g, '_')}.pdf`);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden relative"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Award className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Ձեր Հավաստագիրը</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">KrtLab / Պաշտոնական Ուսումնական Հարթակ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPDF}
              disabled={isGenerating || isAiLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              Ներբեռնել PDF
            </button>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400"
            >
              Փակել
            </button>
          </div>
        </div>

        <div className="p-12 overflow-x-auto flex justify-center bg-slate-100/50">
          {/* Hidden/Preview Certificate for html2canvas */}
          <div 
            ref={certificateRef}
            className="min-w-[1000px] aspect-[1.414/1] bg-white p-16 relative border-[16px] border-double border-slate-200 shadow-2xl"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/20 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-primary/20 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-primary/20 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/20 rounded-br-3xl" />

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Logo size="lg" showText={false} className="w-[500px] h-[500px]" />
            </div>

            <div className="relative h-full flex flex-col items-center text-center justify-between">
              <div className="space-y-6">
                <Logo size="lg" className="scale-125 mb-8" />
                <div className="space-y-2">
                  <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Ավարտական Հավաստագիր</h1>
                  <p className="text-xl text-slate-500 font-bold tracking-[0.2em] uppercase">Certificate of Completion</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 font-medium text-lg italic">Սույնով հավաստվում է, որ</p>
                <h2 className="text-5xl font-black text-primary tracking-tight border-b-4 border-slate-100 pb-4 px-12 inline-block">
                  {profile.name}
                </h2>
                {profile.school && (
                  <p className="text-xl text-slate-600 font-bold">{profile.school}</p>
                )}
                <p className="text-slate-400 font-medium text-lg italic mt-4">հաջողությամբ ավարտել է</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-800">{courseName}</h3>
                  <p className="text-lg text-secondary font-bold uppercase tracking-widest">{levelName}</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto py-8 px-12 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ուսումնական Արդյունքներ / Learning Outcomes</h4>
                {isAiLoading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-400 py-4">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm font-medium">AI-ն գեներացնում է արդյունքները...</span>
                  </div>
                ) : (
                  <p className="text-slate-600 font-medium leading-relaxed italic">
                    "{learningOutcomes}"
                  </p>
                )}
              </div>

              <div className="w-full flex items-end justify-between px-8">
                <div className="text-left space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ամսաթիվ / Date</p>
                    <p className="text-lg font-bold text-slate-800">{completionDate}</p>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="w-48 h-0.5 bg-slate-200 ml-auto" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">KrtLab</p>
                  <p className="text-sm font-bold text-slate-800">Achievement Record</p>
                </div>
              </div>

              {/* This free PDF is an unofficial achievement record, not a verified credential */}
              <div className="absolute top-12 right-12 flex flex-col items-center opacity-20">
                <Award size={80} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Achievement</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-500 text-left">
            <ShieldCheck className="text-slate-300 shrink-0" size={20} />
            <p className="text-sm font-medium">
              Սա անվճար achievement record է, ոչ պաշտոնական հավաստագիր։ Պաշտոնական, ստուգելի KrtLab Verified Certificate ստանալու համար՝
            </p>
          </div>
          <button
            onClick={handleRequestOfficialCertificate}
            disabled={isRequesting}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 shrink-0"
          >
            {isRequesting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Ստանալ Verified Certificate
          </button>
        </div>
        {certRequest && !certRequest.paymentAvailable && (
          <div className="px-8 pb-6 -mt-2">
            <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {certRequest.message}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
