import { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl p-4">{children}</div>;
}


