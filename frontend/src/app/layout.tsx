// ==========================================
// ThreadFlow — Root Layout
// ==========================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ThreadFlow — Embroidery Order & Production Management',
  description:
    'Digitize your embroidery workflow. Manage orders, designs, approvals, production, quality control, and deliveries in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full font-sans antialiased">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
