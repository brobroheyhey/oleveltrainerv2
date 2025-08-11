import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'O-Level Trainer',
  description: 'Spaced repetition trainer for Singapore O-Level students',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto max-w-3xl p-4">{children}</div>
      </body>
    </html>
  );
}


