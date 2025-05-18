'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access was denied. Please try again.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'Verification':
        return 'The verification link may have expired or already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error mb-4">Authentication Error</h2>
          <p className="text-lg mb-6">{getErrorMessage(error)}</p>
          <div className="card-actions justify-end">
            <Link href="/auth/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 