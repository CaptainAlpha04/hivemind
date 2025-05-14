"use client";

import React from "react";
import { MessageSquare, Bell, Sparkles, PlusCircle, Search } from "lucide-react";
import ProfileDropdown from "@/components/ui/Dropdown";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-screen bg-base-200 flex items-center justify-between px-10 py-3 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="avatar">
            <Image src="/images/logo.png" alt="HiveMind" width={40} height={40} />
        </div>
        <div className="text-[28px]">
          <span className="text-white font-light">Hive</span>
          <span className="text-teal-500 font-bold">Mind</span>
        </div>
      </Link>

      {/* Search */}
      <div className="flex items-center gap-5 w-[700px]">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="text-white/50" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search Hives, Stories and more..." 
            className="input input-bordered bg-neutral border-none rounded-full pl-10 pr-4 py-2 w-full" 
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="btn btn-circle btn-ghost border-none">
          <div className="indicator">
            <MessageSquare className="text-white" size={18} />
            <span className="badge badge-xs badge-primary indicator-item">{}</span>
          </div>
        </button>
        <button className="btn btn-circle btn-ghost border-none">
          <div className="indicator">
            <Bell className="text-white" size={18} />
            <span className="badge badge-xs badge-primary indicator-item">{}</span>
          </div>
        </button>
        <button className="btn btn-circle btn-ghost border-none">
          <Sparkles className="text-white" size={18} />
        </button>
        <button className="btn btn-circle btn-ghost hover:bg-primary border-none">
          <PlusCircle size={18} />
        </button>
        <ProfileDropdown 
          profileImage="https://picsum.photos/40/40?random=5"
          userName="Muhammad Ali"
          userTag="#captainAlpha"
        />
      </div>
    </header>
  );
};

export default Header;