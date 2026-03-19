'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MouseFollower } from '@/components/mouse-follower';
import WhatsAppWrapper from '@/components/whatsapp-wrapper';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isAuth && (
        <>
          <MouseFollower />
          <Header />
        </>
      )}
      <main className="flex-1">{children}</main>
      {!isAuth && (
        <>
          <Footer />
          <WhatsAppWrapper />
        </>
      )}
    </div>
  );
}
