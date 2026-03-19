'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, Gamepad2, LogOut } from 'lucide-react'
import { useAuthStore, getDashboardPath } from '@/lib/store/auth'

export default function MarketingHeader() {
  const { user, logout } = useAuthStore()
  const [activeItem, setActiveItem] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLUListElement>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'events', label: 'Events', href: '#events' },
    { id: 'rules', label: 'Rules', href: '#rules' },
    { id: 'prizes', label: 'Prizes', href: '#prizes' },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const animateIndicator = (from: number, to: number) => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }

    const start = Date.now()
    animationRef.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / 500, 1)
      const e = 1 - Math.pow(1 - p, 3)

      const x = from + (to - from) * e
      const y = -40 * (4 * e * (1 - e))
      const r = 200 * Math.sin(p * Math.PI)

      if (navRef.current) {
        navRef.current.style.setProperty('--translate-x', `${x}px`)
        navRef.current.style.setProperty('--translate-y', `${y}px`)
        navRef.current.style.setProperty('--rotate-x', `${r}deg`)

        if (p >= 1) {
          clearInterval(animationRef.current!)
          animationRef.current = null
          navRef.current.style.setProperty('--translate-y', '0px')
          navRef.current.style.setProperty('--rotate-x', '0deg')
        }
      }
    }, 16)
  }

  const getCurrentPosition = (): number => {
    if (!navRef.current) return 0
    const value = navRef.current.style.getPropertyValue('--translate-x')
    return parseFloat(value) || 0
  }

  const getItemCenter = (item: HTMLElement): number => {
    if (!navRef.current) return 0
    const navRect = navRef.current.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    return itemRect.left + itemRect.width / 2 - navRect.left - 5
  }

  const moveToItem = (item: HTMLElement) => {
    const current = getCurrentPosition()
    const center = getItemCenter(item)
    animateIndicator(current, center)
    if (navRef.current) {
      navRef.current.classList.add('show-indicator')
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    moveToItem(e.currentTarget)
  }

  const handleMouseLeave = () => {
    const activeElement = document.querySelector(`[data-nav-id="${activeItem}"]`) as HTMLElement
    if (activeElement) {
      moveToItem(activeElement)
    } else if (navRef.current) {
      navRef.current.classList.remove('show-indicator')
      if (animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }

  const handleClick = (id: string) => {
    setActiveItem(id)
  }

  const handleLogout = async () => {
    await logout()
  }

  useEffect(() => {
    const activeElement = document.querySelector(`[data-nav-id="${activeItem}"]`) as HTMLElement
    if (activeElement) {
      setTimeout(() => moveToItem(activeElement), 100)
    }

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [])

  // ✅ uses getDashboardPath - works for ALL roles
  const dashboardPath = mounted && user ? getDashboardPath(user) : '/dashboard'

  return (
    <>
      <style jsx global>{`
        :root {
          --orange: #ff6b35;
          --red: #ff0000;
          --dark: #0a0a0f;
          --gray: #1a1a1a;
          --light-gray: #2a2a2a;
        }

        /* ✅ REMOVED: body padding-top is now in MarketingLayout only */
        /* This prevents the padding from leaking into login/register pages */
        
        .egaming-header {
          position: fixed;
          top: 52px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          border-radius: 16px;
          background: rgba(26, 26, 26, 0.9);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(255, 107, 53, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
          z-index: 90;
        }

        .egaming-header.scrolled {
          top: 52px;
          padding: 12px 22px;
          background: rgba(26, 26, 26, 0.95);
          border-color: rgba(255, 0, 0, 0.3);
        }

        .header-content {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--orange);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          transition: 0.2s;
          text-transform: uppercase;
          letter-spacing: 2px;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .nav-brand:hover {
          background: rgba(255, 107, 53, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .nav-container {
          flex: 1;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .nav-bg {
          position: absolute;
          inset: 0;
          background: rgba(42, 42, 42, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 107, 53, 0.2);
          z-index: 1;
        }
        
        .nav-list {
          position: relative;
          list-style: none;
          display: flex;
          justify-content: center;
          height: 48px;
          padding: 0 15px;
          z-index: 2;
        }
        
        .nav-list::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 6px;
          width: 12px;
          height: 12px;
          background: var(--red);
          border-radius: 50%;
          transform: translateX(var(--translate-x, 0)) translateY(var(--translate-y, 0));
          opacity: 0;
          box-shadow: 0 0 20px var(--red);
          z-index: 1;
        }
        
        .nav-item {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }
        
        .nav-link {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #999;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          padding-inline: 20px;
          transition: all 0.2s;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .nav-link:hover,
        .nav-link.active {
          color: var(--orange);
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
        }
        
        .nav-list.show-indicator::after {
          opacity: 1;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px 6px 8px;
          border-radius: 30px;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-menu:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: var(--orange);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--orange), var(--red));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .user-role {
          color: var(--orange);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-actions .login-btn {
          color: #999;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 8px;
          transition: 0.2s;
          background: rgba(42, 42, 42, 0.8);
          border: 1px solid rgba(255, 107, 53, 0.2);
          text-decoration: none;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nav-actions .login-btn:hover {
          color: var(--orange);
          background: rgba(255, 107, 53, 0.1);
          border-color: var(--orange);
        }

        .nav-actions .cta-btn {
          background: linear-gradient(135deg, var(--orange), var(--red));
          color: white;
          font-weight: 700;
          padding: 10px 28px;
          border-radius: 25px;
          transition: 0.2s;
          text-decoration: none;
          font-size: 0.95rem;
          border: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .nav-actions .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
        }

        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(42, 42, 42, 0.8);
          border: 1px solid rgba(255, 107, 53, 0.2);
          cursor: pointer;
          color: var(--orange);
          transition: 0.2s;
        }

        .mobile-menu-btn:hover {
          background: rgba(255, 107, 53, 0.1);
          border-color: var(--orange);
        }

        @media (max-width: 768px) {
          .egaming-header {
            width: 95%;
            padding: 12px 18px;
          }

          .nav-brand {
            font-size: 1.25rem;
            padding: 8px 16px;
          }

          .nav-container,
          .nav-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none;
          }
        }
      `}</style>

      <header className={`egaming-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <Link href="/" className="nav-brand">
            <Gamepad2 size={24} />
            ARENA
          </Link>

          <div className="nav-container">
            <div className="nav-bg"></div>
            <nav>
              <ul
                ref={navRef}
                className="nav-list"
                onMouseLeave={handleMouseLeave}
              >
                {navItems.map((item) => (
                  <li key={item.id} className="nav-item">
                    <Link
                      href={item.href}
                      className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                      data-nav-id={item.id}
                      onMouseEnter={handleMouseEnter}
                      onClick={() => handleClick(item.id)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="nav-actions">
            {mounted && user ? (
              <>
                <Link href={dashboardPath} className="cta-btn">
                  Dashboard
                </Link>

                <div className="user-menu" onClick={handleLogout} title="Logout">
                  <div className="user-avatar">
                    {user.firstname?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {user.firstname || user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <LogOut size={16} style={{ marginLeft: '4px', opacity: 0.7 }} />
                </div>
              </>
            ) : mounted ? (
              <>
                <Link href="/login" className="login-btn">
                  Login
                </Link>
                <Link href="/register" className="cta-btn">
                  Apply Now
                </Link>
              </>
            ) : null}
          </div>

          <button className="mobile-menu-btn" aria-label="Menu">
            <Menu size={20} />
          </button>
        </div>
      </header>
    </>
  )
}