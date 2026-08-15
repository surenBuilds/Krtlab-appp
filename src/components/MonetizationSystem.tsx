import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { useUserProfile } from '../hooks/useUserProfile';
import { DollarSign, Activity, CreditCard, Percent, Loader2 } from 'lucide-react';
import { requestSubscriptionCheckout } from '../services/subscriptionService';

export const MonetizationSystem: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const [activePlan] = useState<'free' | 'premium' | 'enterprise'>(
    profile?.isDemoMode ? 'premium' : 'free'
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  // Never activates a plan locally. Real activation only happens server-side
  // after a real payment webhook fires (see server.ts /api/subscriptions/checkout).
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutMessage(null);
    try {
      const result = await requestSubscriptionCheckout('premium');
      if (result.paymentAvailable && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setCheckoutMessage(result.message || 'Վճարային համակարգը դեռ միացված չէ։ Premium-ը դեռ հասանելի չէ գնման համար։');
    } catch (err: any) {
      setCheckoutMessage(err.message);
    } finally {
      setIsCheckingOut(false);
    }
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
              <span className="text-4xl font-black text-white">9,900 ֏</span>
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
              <span className="text-lg font-black text-slate-900">80% / 20%</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl">
              <span className="block text-[8px] text-slate-400 font-bold uppercase">Բալանս</span>
              <span className="text-lg font-black text-slate-400">$0.00</span>
              <span className="block text-[7px] text-slate-400 font-medium mt-0.5">Իրական payout tracking դեռ չկա</span>
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

      {/* Checkout Modal — honest: no card fields, no fake activation */}
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
                  <p className="text-slate-500 text-xs font-medium">KrtLab Premium բաժանորդագրություն</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-center">
                  <p className="text-3xl font-black text-slate-900">9,900 ֏</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">/ ամսական, KrtLab Premium</p>
                </div>

                {checkoutMessage && (
                  <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    {checkoutMessage}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
                    Անցնել Վճարման
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
