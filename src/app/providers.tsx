'use client'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { HelmetProvider } from 'react-helmet-async';
import { useMobileQuery } from '@/utiils/utils';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

function Providers({children, ...props}: { children: React.ReactNode }) {
  const isMobile = useMobileQuery();

  return (
    <NextThemesProvider attribute='class' defaultTheme='system' {...props}>
      <HelmetProvider>
        <HeroUIProvider>
          <ToastProvider placement={isMobile ? 'top-center' : 'bottom-right'}/>
          {children}
        </HeroUIProvider>
      </HelmetProvider>
    </NextThemesProvider>
  )
}

export default Providers;
