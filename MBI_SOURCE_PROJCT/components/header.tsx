'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth"  // ✅ FIXED

const navLinks = [
  { href: "/", label: "Home" },
]

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-sky-500 to-blue-600 backdrop-blur supports-[backdrop-filter]:bg-sky-500/95"
      style={{ height: "90px" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
          >
            <Image
              src="/logo.png"
              alt="MBI Digital Logo"
              width={150}
              height={50}
              priority
              className="p-5"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (!pathname && link.href === "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative font-medium text-lg transition-all duration-300
                    ${isActive ? 'text-white' : 'text-white/80'}
                    hover:text-white
                  `}
                >
                  {link.label}

                  <span
                    className={`
                      absolute -bottom-1 left-0 w-full h-0.5 origin-left transition-transform duration-300
                      bg-white
                      ${isActive ? 'scale-x-100' : 'scale-x-0'}
                      group-hover:scale-x-100
                    `}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* ✅ FIXED: Changed to /dashboard */}
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl border-2 border-white text-white hover:bg-white hover:text-sky-600 font-semibold shadow-md transition-all duration-300"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="lg"
                  onClick={() => logout()}
                  className="rounded-2xl bg-white text-sky-600 hover:bg-gray-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl border-2 border-white text-white hover:bg-white hover:text-sky-600 font-semibold shadow-md transition-all duration-300"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-2xl bg-white text-sky-600 hover:bg-gray-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex flex-wrap items-center justify-center gap-4 pt-3 pb-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (!pathname && link.href === "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative font-medium text-base transition-all duration-300
                  ${isActive ? 'text-white' : 'text-white/80'}
                  hover:text-white
                `}
              >
                {link.label}

                <span
                  className={`
                    absolute -bottom-1 left-0 w-full h-0.5 origin-left transition-transform duration-300
                    bg-white
                    ${isActive ? 'scale-x-100' : 'scale-x-0'}
                    group-hover:scale-x-100
                  `}
                />
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}