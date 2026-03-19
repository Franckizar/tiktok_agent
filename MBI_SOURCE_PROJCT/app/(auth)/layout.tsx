import AuthHeader from '@/components/auth/Authheader';
import AuthFooter from '@/components/auth/Authfooter';


/**
 * AUTH LAYOUT
 * Used for: /login, /register, /forgot-password, etc.
 * 
 * Features:
 * - Simple header with logo and login/signup buttons
 * - Minimal footer with copyright
 * - Clean, distraction-free design focused on forms
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Header - Simple and clean */}
      <AuthHeader />
      
      {/* Main Content Area - Where login/register forms appear */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Auth Footer - Minimal copyright */}
      <AuthFooter />
    </div>
  );
}