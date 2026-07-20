import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Code, Key, Copy, Check, Terminal, Play, Cpu, Layers } from 'lucide-react';
import { toast } from 'sonner';

export const DeveloperPlatform: React.FC = () => {
  const { t } = useTranslation();
  const [apiToken, setApiToken] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'curl' | 'node' | 'python'>('curl');

  const handleGenerateToken = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newToken = `krt_live_${randomHex}`;
    setApiToken(newToken);
    toast.success('Նոր API Տոկենը հաջողությամբ գեներացվեց:');
  };

  const handleCopyToken = () => {
    if (!apiToken) return;
    navigator.clipboard.writeText(apiToken);
    setIsCopied(true);
    toast.success('API Տոկենը պատճենվեց:');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const snippets = {
    curl: `curl -X POST https://api.krtlab.com/v1/ai-mentor/chat \\
  -H "Authorization: Bearer \${KRTLAB_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mentorId": "m2",
    "message": "Բացատրիր Recursion-ը պարզ օրինակով:"
  }'`,
    node: `import { KrtLabSDK } from '@krtlab/sdk';

const krt = new KrtLabSDK({
  apiKey: process.env.KRTLAB_API_KEY
});

const response = await krt.aiMentor.chat({
  mentorId: 'm2',
  message: 'Բացատրիր Recursion-ը պարզ օրինակով:'
});

console.log(response.text);`,
    python: `from krtlab import KrtLab

krt = KrtLab(api_key="your_api_key_here")

response = krt.ai_mentor.chat(
    mentor_id="m2",
    message="Բացատրիր Recursion-ը պարզ օրինակով:"
)

print(response.text)`
  };

  return (
    <div className="space-y-8" id="developer-platform-container">
      {/* Header section */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Terminal className="text-primary" size={32} />
          {t('devPlatform.title')}
        </h2>
        <p className="text-slate-500 font-medium mt-2 max-w-xl">
          {t('devPlatform.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Generator Card */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2">
            <Key className="text-primary" size={20} />
            <h3 className="text-lg font-black text-slate-900">{t('devPlatform.apiTokens')}</h3>
          </div>

          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            Օգտագործեք API տոկենները ձեր սեփական ծրագրերից KrtLab ԱԲ ուսումնական մոդուլներին միանալու համար:
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGenerateToken}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Cpu size={14} />
              <span>{t('devPlatform.generateToken')}</span>
            </button>

            {apiToken && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs text-slate-800 break-all select-all">
                <span>{apiToken}</span>
                <button onClick={handleCopyToken} className="text-slate-400 hover:text-slate-900 ml-2 cursor-pointer shrink-0">
                  {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Code Snippets & Docs */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">{t('devPlatform.snippets')}</h3>
              
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-150">
                {(['curl', 'node', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                      activeLang === lang ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node' : 'Python'}
                  </button>
                ))}
              </div>
            </div>

            {/* JetBrains Mono editor styling */}
            <div className="bg-slate-950 p-5 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto border border-slate-850">
              <pre>{snippets[activeLang]}</pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('devPlatform.integrationGuide')}</span>
            <span className="text-xs font-black text-primary hover:underline cursor-pointer flex items-center gap-1">
              Read Docs <Play size={10} fill="currentColor" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
