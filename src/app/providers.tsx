'use client'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

function Providers({children, ...props}: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' {...props}>
      <HelmetProvider>
        <HeroUIProvider>
          <ToastProvider/>
          {children}
        </HeroUIProvider>
      </HelmetProvider>
    </NextThemesProvider>
  )
}

export default Providers;