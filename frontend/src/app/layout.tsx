import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHIELD-OPS | Enterprise Security Workforce Platform',
  description: 'Production-grade security workforce management platform with dynamic multi-site rostering, 12h shifts, and 6/1 duty rules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
