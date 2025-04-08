'use client'
import { HeroUIProvider } from '@heroui/react'
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({children, ...props}: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' {...props}>
      <HelmetProvider>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </HelmetProvider>
    </NextThemesProvider>
  )
}