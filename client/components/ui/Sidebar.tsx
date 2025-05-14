"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Home, 
  Compass, 
  Flame, 
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  // Add state for sidebar collapsed status
  const [collapsed, setCollapsed] = useState(false);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  // Determine icon size based on sidebar state
  const iconSize = collapsed ? 26 : 20;

  return (
    <>
      {/* Vertical divider line */}
      <div className={`fixed top-[70px] ${collapsed ? 'left-[80px]' : 'left-[280px]'} w-[1px] h-[calc(100vh-70px)] bg-white/10 z-[95] transition-all duration-300`} />
      
      {/* Toggle button on the divider */}
      <button 
        className={`fixed top-1/2 ${collapsed ? 'left-[80px]' : 'left-[280px]'} w-[30px] h-[30px] rounded-full bg-base-300 border border-white/20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer z-[96] p-0 transition-all duration-300`}
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight className="text-base-content" size={20} /> : <ChevronLeft className="text-base-content" size={20} />}
      </button>
      
      <aside 
        className={`${collapsed ? 'w-[80px]' : 'w-[280px]'} bg-base-200 text-base-content p-6 flex flex-col gap-8 fixed top-[70px] left-0 h-[calc(100vh-70px)] overflow-hidden transition-all duration-300 ease-in-out z-[90] backdrop-blur-sm`}
        onMouseEnter={(e) => e.currentTarget.classList.replace("overflow-hidden", "overflow-auto")}
        onMouseLeave={(e) => e.currentTarget.classList.replace("overflow-auto", "overflow-hidden")}
      >
        <nav className={`flex flex-col ${collapsed ? 'items-center' : 'items-start'} gap-4`}>
          <Link href="/" className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} ${collapsed ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content font-medium text-lg hover:text-primary transition-colors ${collapsed ? 'hover:bg-white/5 rounded-lg p-2' : ''}`}>
            <Home size={iconSize} className={collapsed ? 'transition-all duration-300' : ''} />
            {!collapsed && "Home"}
          </Link>
          
          <Link href="/explore" className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} ${collapsed ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed ? 'hover:bg-white/5 rounded-lg p-2' : ''}`}>
            <Compass size={iconSize} className={collapsed ? 'transition-all duration-300' : ''} />
            {!collapsed && "Explore"}
          </Link>
          
          <Link href="/trending" className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} ${collapsed ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed ? 'hover:bg-white/5 rounded-lg p-2' : ''}`}>
            <Flame size={iconSize} className={collapsed ? 'transition-all duration-300' : ''} />
            {!collapsed && "Trending"}
          </Link>
          
          <Link href="/new" className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} ${collapsed ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed ? 'hover:bg-white/5 rounded-lg p-2' : ''}`}>
            <PlusCircle size={iconSize} className={collapsed ? 'transition-all duration-300' : ''} />
            {!collapsed && "New"}
          </Link>
        </nav>

        {!collapsed && (
          <>
            <div className="divider my-1 before:bg-white/10 after:bg-white/10"></div>

            <div>
              <h3 className="font-semibold mb-3 text-xl">Hives</h3>
              <div className="flex flex-col gap-3">
                {/* Hive items will come from API */}
              </div>
            </div>
            
            <div className="divider my-1 before:bg-white/10 after:bg-white/10"></div>
            
            <div>
              <h3 className="font-semibold mb-3 text-xl">Recently Visited</h3>
              <div className="flex flex-col gap-3">
                {/* Recently visited items will come from API */}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;