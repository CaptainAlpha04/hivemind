"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";

const ProfileDropdown = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  useEffect(() => {
    if (isSigningOut && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, isSigningOut, router]);
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
  };
  // No need to use useState with DaisyUI's dropdown
  return (
    <div className="dropdown dropdown-end ml-2 bg-base-100 z-index-50 text-base-content">
      {/* The button that opens the dropdown - using details/summary for better accessibility */}
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar online">
        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-200 ring-offset-2">
          <img src={session?.user?.image || '/images/user.png'} alt="profile" />
        </div>
      </label>
      
      <ul tabIndex={0} className="dropdown-content z-[1] bg-base-200 menu p-3 shadow-lg rounded-box w-52 mt-2">
        <div className="px-2 py-2 mb-2 border-b border-white/10">
          <div className="font-semibold text-base">{session?.user?.name}</div>
          <div className="text-primary text-xs">{session?.user?.email}</div>
        </div>
        <li>
          <a className="flex items-center hover:text-primary hover:hover:bg-gray-700/20">
            <User size={16} />
            Profile
          </a>
        </li>
        <li>
          <Link href="/profile/settings" className="flex items-center hover:text-primary hover:bg-gray-700/20">
            <Settings size={16} />
            Settings
          </Link>
        </li>
        <li>
            <button
            onClick={() => {
              handleSignOut();
            }}
            className="flex items-center hover:text-primary hover:bg-gray-700/20"
            >
            <LogOut size={16} />
            Logout
            </button>
        </li>
          <li>
            <ThemeSwitch />
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;