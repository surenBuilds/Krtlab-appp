import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, Loader2, Award } from 'lucide-react';
import { Certificate } from '../types';
import { getCertificateForVerification } from '../services/certificateService';
import { Logo } from './Logo';

interface Props {
  certificateId: string;
}

/**
 * Rendered standalone (see main.tsx) at /verify/{certificateId} — no auth,
 * no app shell. This is the page a certificate's QR code / URL points to,
 * so an employer or reviewer can confirm a certificate is real without an account.
 */
export const CertificateVerificationPage: React.FC<Props> = ({ certificateId }) => {
  const [cert, setCert] = useState<Certificate | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    getCertificateForVerification(certificateId)
      .then(setCert)
      .catch(() => setCert(null));
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 text-center">
        <Logo size="md" className="mx-auto mb-6" />

        {cert === undefined && (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm font-bold">Ստուգվում է...</span>
          </div>
        )}

        {cert === null && (
          <div className="flex flex-col items-center gap-3 py-8">
            <ShieldX className="text-red-500" size={48} />
            <h1 className="text-xl font-black text-slate-900">Հավաստագիրը չի հաստատվել</h1>
            <p className="text-sm text-slate-500 font-medium">
              ID <span className="font-mono">{certificateId}</span>-ով ոչ մի issued հավաստագիր չգտնվեց։
            </p>
          </div>
        )}

        {cert && (
          <div className="flex flex-col items-center gap-4 py-4">
            <ShieldCheck className="text-emerald-500" size={48} />
            <h1 className="text-xl font-black text-slate-900">Հավաստագիրը իսկական է</h1>
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-6 text-left space-y-3 mt-2">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <span className="font-black text-slate-900">{cert.skillTitle}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Տրվել է՝ {cert.issueDate.slice(0, 10)}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Mastery հաստատման պահին՝ {cert.masteryPercentAtIssue}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
                {cert.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
