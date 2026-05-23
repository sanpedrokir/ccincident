import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CC Incident Management',
  description: 'Customer Care VVIP Incident Recording and Reporting System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <div className="flex h-full min-h-screen">
          <Navigation />
          {/* pt-16 offsets the fixed mobile top bar; removed on md+ where sidebar is used */}
          <main className="flex-1 overflow-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
