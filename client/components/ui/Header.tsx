"use client";

import React from "react";
import { MessageSquare, Bell, Sparkles, PlusCircle, Search, PenIcon, Home, Flame, Compass } from "lucide-react";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  
  // Check if the current route is active
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <>
      {/* Desktop Header - remains unchanged */}
      <header className="fixed top-0 left-0 w-screen bg-base-100/50 hidden md:flex items-center justify-between px-10 py-3 z-20 backdrop-blur-lg text-base-content">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="avatar">
              <Image src="/images/logo.png" alt="HiveMind" width={40} height={40} />
          </div>
          <div className="text-[28px]">
            <span className="text-base-content font-light">Hive</span>
            <span className="text-teal-500 font-bold">Mind</span>
          </div>
        </Link>

        {/* Search */}
        <div className="flex items-center gap-5 w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-2">
              <Search className="text-base-content" size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search Hives, Stories and more..." 
              className="input input-bordered input-primary bg-base-300 border-none rounded-full pl-10 pr-4 py-2 w-full" 
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
        
          <button className="btn btn-circle btn-ghost border-none tooltip tooltip-bottom" data-tip="Chat">
            <Link href="/chat" className="indicator">
              <MessageSquare className="text-base-content" size={18} />
              <span className="badge badge-xs badge-primary indicator-item">{}</span>
            </Link>
          </button>

          <button className="btn btn-circle btn-ghost border-none tooltip tooltip-bottom" data-tip="Notifications">
            <div className="indicator">
              <Bell className="text-base-content" size={18} />
              <span className="badge badge-xs badge-primary indicator-item">{}</span>
            </div>
          </button>

          <button className="btn btn-circle btn-ghost border-none tooltip tooltip-bottom" data-tip="Synergy">
            <Sparkles className="text-base-content" size={18} />
          </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-circle btn-ghost hover:bg-primary border-none tooltip tooltip-bottom" data-tip="Create">
                <PlusCircle className="text-base-content" size={18} />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link href="/posts/create" className="flex items-center gap-2">
                    <PenIcon className="text-base-content" size={18} />
                    Post
                  </Link>
                </li>
                <li>
                  <Link href="/hives/create"  className="flex items-center gap-2">
                    <PlusCircle className="text-base-content" size={18} />
                    Hive
                  </Link>
                </li>
              </ul>
            </div>
          <div className="tooltip tooltip-bottom" data-tip="Profile">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 w-full bg-base-100/50 md:hidden flex items-center justify-between px-4 py-3 z-20 backdrop-blur-lg text-base-content">
        {/* Logo */}
        <Link href="/" className="flex items-center ml-10">
          <div className="avatar">
            <Image src="/images/logo.png" alt="HiveMind" width={32} height={32} />
          </div>
          <div className="text-[20px] ml-2">
            <span className="text-base-content font-light">Hive</span>
            <span className="text-teal-500 font-bold">Mind</span>
          </div>
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-circle btn-ghost">
            <Search className="text-base-content" size={18} />
          </button>
          <div className="tooltip tooltip-bottom" data-tip="Profile">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-base-100/90 backdrop-blur-lg flex items-center justify-around py-1 z-20 border-t border-white/10">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/') ? 'text-primary' : 'text-base-content'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-0.5">Home</span>
        </Link>
        
        <Link 
          href="/explore" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/explore') ? 'text-primary' : 'text-base-content'}`}
        >
          <Compass size={20} />
          <span className="text-xs mt-0.5">Explore</span>
        </Link>
        
        <div className="dropdown dropdown-top">
          <div tabIndex={0} role="button" className="flex flex-col items-center justify-center p-2">
            <PlusCircle size={24} className="text-primary" />
            <span className="text-xs mt-0.5">Create</span>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu shadow-lg bg-base-200 rounded-box w-52 mb-2">
            <li>
              <Link href="/posts/create" className="flex items-center gap-2">
                <PenIcon className="text-base-content" size={18} />
                Post
              </Link>
            </li>
            <li>
              <Link href="/hives/create" className="flex items-center gap-2">
                <PlusCircle className="text-base-content" size={18} />
                Hive
              </Link>
            </li>
          </ul>
        </div>
        
        <Link 
          href="/notifications" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/notifications') ? 'text-primary' : 'text-base-content'}`}
        >
          <div className="indicator">
            <Bell size={20} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
          <span className="text-xs mt-0.5">Alerts</span>
        </Link>
        
        <Link 
          href="/chat" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/chat') ? 'text-primary' : 'text-base-content'}`}
        >
          <div className="indicator">
            <MessageSquare size={20} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
          <span className="text-xs mt-0.5">Chats</span>
        </Link>
      </nav>
      
      {/* Add spacing for mobile layout */}
      <div className="md:h-[70px] h-[56px]"></div>
      <div className="md:hidden h-[60px]"></div>
    </>
  );
};

export default Header;