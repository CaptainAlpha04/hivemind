"use client";

import React from "react";
import Link from "next/link";
import { 
  Home, 
  Compass, 
  Flame, 
  PlusCircle,
  ChevronLeft,
} from "lucide-react";

const Sidebar = () => {
  return (
    <>
      {/* Vertical divider line */}
      <div className="fixed top-[70px] left-[280px] w-[1px] h-[calc(100vh-70px)] bg-white/10 z-[95]" />
      
      {/* Toggle button on the divider */}
      <button className="fixed top-1/2 left-[280px] w-[30px] h-[30px] rounded-full bg-black border border-white/20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer z-[96] p-0">
        <ChevronLeft className="text-white" size={20} />
      </button>
      
      <aside 
        className="w-[280px] bg-[#1a1f29] text-white p-6 flex flex-col gap-8 fixed top-[70px] left-0 h-[calc(100vh-70px)] overflow-hidden transition-all duration-300 ease-in-out z-[90] backdrop-blur-sm"
        onMouseEnter={(e) => e.currentTarget.classList.replace("overflow-hidden", "overflow-auto")}
        onMouseLeave={(e) => e.currentTarget.classList.replace("overflow-auto", "overflow-hidden")}
      >
        <nav className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 text-white no-underline font-medium text-lg hover:text-accent transition-colors">
            <Home size={20} />
            Home
          </Link>
          <Link href="/explore" className="flex items-center gap-3 text-white no-underline font-medium text-lg hover:text-accent transition-colors">
            <Compass size={20} />
            Explore
          </Link>
          <Link href="/trending" className="flex items-center gap-3 text-white no-underline font-medium text-lg hover:text-accent transition-colors">
            <Flame size={20} />
            Trending
          </Link>
          <Link href="/new" className="flex items-center gap-3 text-white no-underline font-medium text-lg hover:text-accent transition-colors">
            <PlusCircle size={20} />
            New
          </Link>
        </nav>
        
        <div>
          <Link href="/hives" className="font-semibold mb-3 text-xl text-white no-underline block hover:text-accent transition-colors">
            Your Hives
          </Link>
          <div className="flex flex-col gap-3">
            
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3 text-xl">Recently Visited</h3>
          <div className="flex flex-col gap-3">
            
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;