'use client'
import { useEffect, useState } from 'react';
import { Provider } from "react-redux";
import { store } from "./store/store";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem('theme');
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  if (!mounted) return null;
  return <Provider store={store}>{children}</Provider>;
}