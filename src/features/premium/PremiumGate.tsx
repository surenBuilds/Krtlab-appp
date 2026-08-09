import React, { useState } from "react";
export function usePremium() { return { isPro: false, tier: "free", canAccess: () => false }; }
export const PremiumGate: React.FC<{ feature: string; children: React.ReactNode; requiredLevel?: number }> = ({ children }) => <>{children}</>;
export default PremiumGate;
