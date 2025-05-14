"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  profileImage: string;
  userName: string;
  userTag: string;
}

const ProfileDropdown = ({ profileImage, userName, userTag }: ProfileDropdownProps) => {
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
    <div className="dropdown dropdown-end ml-2">
      {/* The button that opens the dropdown - using details/summary for better accessibility */}
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar online">
        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-200 ring-offset-2">
          <img src={profileImage} alt="profile" />
        </div>
      </label>
      
      {/* The dropdown menu - DaisyUI will handle opening/closing */}
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow-lg bg-[#232a3a] rounded-box w-52 mt-2">
        <div className="px-2 py-2 mb-2 border-b border-white/10">
          <div className="text-white font-semibold text-base">{userName}</div>
          <div className="text-primary text-xs">{userTag}</div>
        </div>
        <li>
          <a className="flex items-center text-white/80 hover:text-primary hover:bg-white/5">
            <User size={16} />
            Profile
          </a>
        </li>
        <li>
          <a className="flex items-center text-white/80 hover:text-primary hover:bg-white/5">
            <Settings size={16} />
            Settings
          </a>
        </li>
        <li>
            <button
            onClick={() => {
              handleSignOut();
            }}
            className="flex items-center text-white/80 hover:text-primary hover:bg-white/5"
            >
            <LogOut size={16} />
            Logout
            </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;