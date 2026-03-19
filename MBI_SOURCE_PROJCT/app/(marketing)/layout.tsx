import MarketingHeader from '@/components/marketing/Marketingheader'
import MarketingFooter from '@/components/auth/Authfooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* ✅ Body padding lives HERE - only affects marketing pages */}
      <style>{`
        body {
          padding-top: 140px;
          font-family: 'Rajdhani', 'Poppins', sans-serif;
          background: #0a0a0f;
        }
        @media (max-width: 768px) {
          body { padding-top: 120px; }
        }
      `}</style>
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  )
}