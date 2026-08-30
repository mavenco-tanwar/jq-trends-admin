'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CouponsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/discounts');
  }, [router]);
  return null;
}
