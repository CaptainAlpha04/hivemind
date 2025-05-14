'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Bell, Sparkles, PlusCircle, Search } from "lucide-react";
import ChatMenu from '@/components/chat/ChatMenu';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Client-side authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting from chat page');
      router.push('/auth/login?callbackUrl=/chat');
    } else if (status === 'authenticated') {
      // You now have access to the user ID
      console.log('User ID in chat page:', session.user?.id);
    }
  }, [status, session, router]);

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <section className='bg-base-100 min-h-screen w-screen bg-gradient-to-br flex justify-center items-center'>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Loading chat...</p>
        </div>
      </section>
    );
  }

  // Prevent rendering if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect in the useEffect
  }

  return (
    <section className='bg-base-100 min-h-screen w-screen bg-gradient-to-br'>
      <ChatMenu />
    </section>
  );
}
