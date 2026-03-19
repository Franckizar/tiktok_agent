// components/ClientProviders.tsx
'use client'

import { ThemeProvider } from '@/components/theme-provider'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
// ```

// ---

// # How It Works Now:
// ```
// App Crashes → ErrorBoundary catches it → Shows friendly UI
//      ↓
// User clicks "Try Again" → Error cleared → Page retries
// User clicks "Go Home" → Redirected to homepage
// ```

// **In development** you also see the actual error message:
// ```
// TypeError: Cannot read properties of undefined
// ```

// **In production** users only see the friendly message.

// ---

// # File Summary So Far:
// ```
// lib/
// ├── utils/
// │   ├── logger.ts         ← Step 1 ✅
// │   └── errors.ts         ← Step 2 ✅
// components/
// └── ErrorBoundary.tsx     ← Step 3 ✅