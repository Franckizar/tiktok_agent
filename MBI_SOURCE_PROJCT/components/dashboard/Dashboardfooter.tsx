export default function DashboardFooter() {
  return (
    <footer className="relative bg-[#0a0a0f] border-t border-[#ff6b35]/10 mt-auto">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/20 to-transparent" />

      <div className="px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
            <span>All systems operational</span>
            <span className="text-gray-700">•</span>
            <span>© {new Date().getFullYear()} <span className="text-[#ff6b35]/70">MBI Arena</span></span>
          </div>

          <div className="flex items-center gap-4">
            {['Help', 'Privacy', 'Terms'].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-[#ff6b35] transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}