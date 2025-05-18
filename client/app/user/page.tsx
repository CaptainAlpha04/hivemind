"use client";

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Header from '@/components/ui/Header';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // Redirect to the user's own profile
      router.push(`/user/${session.user.id}`);
    } else if (status === 'unauthenticated') {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
    // While loading, the component will render the loading spinner
  }, [router, session, status]);

  return (
    <div className="min-h-screen flex flex-col bg-base-300">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    </div>
  );
}