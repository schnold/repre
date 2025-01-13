"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const showHeader = pathname !== '/';

  if (!showHeader) return null;
  return <Header />;
} 