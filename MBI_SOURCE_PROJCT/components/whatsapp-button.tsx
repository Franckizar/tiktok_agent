'use client'

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils/utils"

export default function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/237676966081?text=Hi!%20I%20have%20a%20question%20about%20your%20services."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat, Chat with us on WhatsApp"
    >
      {/* Unfolding Button */}
      <div className="flex items-center gap-0 overflow-hidden rounded-full bg-white shadow-lg transition-all duration-500 ease-out group-hover:gap-3 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:pr-4">
        
        {/* WhatsApp Logo */}
        <div className="relative h-14 w-14 flex-shrink-0 rounded-full bg-white p-1.5 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/40">
          <Image
            src="/whatsapp-logo.png"
            alt="WhatsApp"
            width={56}
            height={56}
            className="rounded-full object-contain"
            priority
          />
          {/* Subtle pulse */}
          <span className="absolute inset-0 -z-10 rounded-full bg-green-400/30 animate-ping" />
        </div>

        {/* Text: Unfolds on hover */}
        <span
          className={cn(
            "max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold text-green-700 dark:text-green-300 transition-all duration-500 ease-out",
            "opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:delay-100"
          )}
        >
          Chat with us!
        </span>
      </div>
    </Link>
  )
}

// Pulse Animation
;<style jsx>{`
  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    70%, 100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }
  .animate-ping {
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
`}</style>