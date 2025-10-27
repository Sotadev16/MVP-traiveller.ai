"use client";

import { TravelDataProvider } from '@/contexts/TravelDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TravelDataProvider>
      {children}
    </TravelDataProvider>
  );
}
