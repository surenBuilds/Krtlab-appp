import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { useUserProfile } from '../hooks/useUserProfile';
import { DollarSign, ShieldCheck, HelpCircle, Activity, CreditCard, Sparkles, Building2, UserCheck, Percent } from 'lucide-react';
import { toast } from 'sonner';

export const MonetizationSystem: React.FC = () => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useUserProfile();
  const [activePlan, setActivePlan] = useState<'free' | 'premium' | 'enterprise'>(
    profile?.isDemoMode ? 'premium' : 'free'
  );
  const [isOpen, setIsOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      toast.error('Լրացրեք քարտի բոլոր տվյալները:');
      return;
    }

    setActivePlan('premium');
    updateProfile({ isDemoMode: true }); // Mocking premium state using isDemoMode flag
    setIsOpen(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    toast.success('Շնորհավորում ենք: Ձեր KrtLab Premium բաժանորդագրությունը հաջողությամբ ակտիվացավ:', {
      icon: <Sparkles className="text-secondary" />
    });
  };

  return (
    <div className="space-y-8" id="monetization-system-container">
      {/* Header section */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <DollarSign className="text-primary" size={32} />
          {t('monetization.title')}
        </h2>
        <p className="text-slate-500 font-medium mt-2 max-w-xl">
          {t('monetization.subtitle')}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
              {t('monetization.freePlan')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-400 font-bold text-xs">/ ամիս</span>
            </div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Իդեալական է սկսնակների համար, ովքեր ցանկանում են ծանոթանալ KrtLab-ի հիմնական գործիքներին:
            </p>
            <ul className="space-y-2 pt-4">
              {['Անվճար ԱԲ Մենթորներ', '10 Դասընթացներ', 'Օրական 1 քվիզ', 'Հիմնական Պորտֆոլիո'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            disabled={activePlan === 'free'}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-sm transition-all mt-6 ${
              activePlan === 'free'
                ? 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
            }`}
          >
            {activePlan === 'free' ? t('monetization.activePlan') : 'Անցնել'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-950 text-white rounded-[2.5rem] border border-primary/20 p-8 shadow-xl flex flex-col justify-between min-h-[400px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
              {t('monetization.premiumPlan')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$15</span>
              <span className="text-slate-400 font-bold text-xs">/ ամիս</span>
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Բացեք KrtLab-ի ամբողջական հզորությունը՝ ներառյալ անսահմանափակ ԱԲ գեներացիաներ և լաբեր:
            </p>
            <ul className="space-y-2 pt-4">
              {['Անսահմանափակ ԱԲ Մենթորներ', 'Գեներացվող Կուրսեր', 'Բոլոր Ինտերակտիվ Լաբերը', 'Ցմահ Դիջիթալ Անձնագիր', 'Verified Badges', 'Հեղինակային Մոդուլներ'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            disabled={activePlan === 'premium'}
            className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all mt-6 cursor-pointer relative z-10 ${
              activePlan === 'premium'
                ? 'bg-emerald-500 border border-emerald-600 text-white cursor-not-allowed'
                : 'bg-primary hover:bg-primary/95 text-white'
            }`}
          >
            {activePlan === 'premium' ? t('monetization.activePlan') : t('monetization.upgradeNow')}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
              {t('monetization.enterprisePlan')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">Custom</span>
            </div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Լուծումներ դպրոցների, համալսարանների և ընկերությունների համար՝ խմբային կառավարմամբ։
            </p>
            <ul className="space-y-2 pt-4">
              {['Organization Dashboard', 'Student Roster Management', 'AI Cohort Analytics', 'API & SDK Access', 'Dedicated Support'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs shadow-sm transition-all mt-6 cursor-pointer">
            Կապնվել Մեզ հետ
          </button>
        </div>
      </div>

      {/* Creator revenue details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="text-primary" size={20} />
            <h4 className="font-black text-slate-900 text-sm">{t('monetization.creatorRevenue')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl">
              <span className="block text-[8px] text-slate-400 font-bold uppercase">{t('monetization.commissionRate')}</span>
              <span className="text-lg font-black text-slate-900">70% / 30%</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl">
              <span className="block text-[8px] text-slate-400 font-bold uppercase">Բալանս</span>
              <span className="text-lg font-black text-emerald-600">$340.50</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Activity className="text-primary" size={16} />
              {t('monetization.analyticsRevenue')}
            </h4>
            <p className="text-slate-500 text-xs font-medium max-w-sm">
              Հետևեք ձեր վաճառված դասընթացների և ԱԲ մենթորների բաժանորդագրությունների ամսական վիճակագրությանը:
            </p>
          </div>
          <div className="w-32 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
            Chart coming soon
          </div>
        </div>
      </div>

      {/* Checkout Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">KrtLab Checkout</h3>
                  <p className="text-slate-500 text-xs font-medium">Անվտանգ վճարում Stripe-ով</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Card Number (Քարտի Համար)</label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="4000 1234 5678 9010"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase">Expiry (Ժամկետ)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase">CVC / CVV</label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="•••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Վճարել $15.00
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
