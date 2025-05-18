"use client";

import UserProfile from '@/components/profile/profile'
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation';

function Page() {
  const params = useParams();
  
  // Add debugging to see what's in params
  useEffect(() => {
    console.log("User page params:", params);
  }, [params]);
  
  const userId = params?.user?.toString();

  console.log("User ID extracted:", userId);
  
  // Add fallback for missing userId
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">User ID Not Found</h2>
          <p>Could not load user profile because the ID is missing.</p>
          <pre className="mt-4 p-4 bg-base-300 rounded text-left overflow-auto">
            {JSON.stringify(params, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UserProfile userId={userId} />
    </div>
  )
}

export default Page