"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/verify-email/${token}`);
        
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin mb-4 h-12 w-12 border-t-2 border-b-2 border-teal-400 rounded-full mx-auto"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
              <p className="text-slate-300">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4 h-16 w-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email Verified!</h2>
              <p className="text-slate-300 mb-6">Your email has been successfully verified.</p>
              <Link href="/auth/login" className="modern-button inline-block">
                Sign In
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-4 h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
              <p className="text-slate-300 mb-6">The verification link is invalid or has expired.</p>
              <Link href="/auth/login" className="modern-button inline-block">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}