"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  Home, 
  Compass, 
  Flame, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Menu,
  Clock12
} from "lucide-react";

// Define a proper interface for community data
interface Community {
  _id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  profilePicture?: any;
}

const Sidebar = () => {
  // Add state for sidebar collapsed status
  const [collapsed, setCollapsed] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Function to toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Determine icon size based on sidebar state
  const iconSize = collapsed ? 26 : 20;
  
  // Close sidebar on outside click (mobile only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);
  
  // Handle ESC key to close mobile sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (mobileOpen && event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [mobileOpen]);

  // Fetch communities when component mounts or session changes
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        if (!apiUrl) {
          console.error('API URL is not defined');
          setLoading(false);
          return;
        }

        let url;
        // If user is logged in, fetch communities they're a member of
        if (session?.user?.id) {
          url = `${apiUrl}/api/communities/user/${session.user.id}`;
        } else {
          // For non-logged in users, fetch public communities
          url = `${apiUrl}/api/communities`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch communities: ${response.status}`);
        }
        
        let data = await response.json();
        
        // If no communities found, fetch public ones as fallback
        if (data.length === 0 && session?.user?.id) {
          const publicResponse = await fetch(`${apiUrl}/api/communities`);
          if (publicResponse.ok) {
            data = await publicResponse.json();
          }
        }
        
        // Take only top 3 communities
        const topCommunities = data.slice(0, 3);
        setCommunities(topCommunities);
      } catch (error) {
        console.error('Error fetching communities:', error);
        // Fallback: If error occurs, try fetching public communities
        if (session?.user?.id && apiUrl) {
          try {
            const fallbackResponse = await fetch(`${apiUrl}/api/communities`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setCommunities(fallbackData.slice(0, 3));
            }
          } catch (fallbackError) {
            console.error('Error fetching fallback communities:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [apiUrl]);

  // Properly handle community profile images
  const CommunityAvatar = ({ community }: { community: Community }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = apiUrl ? 
      `${apiUrl}/api/communities/${community._id}/profilePicture` :
      '/default-community.png';

    return (
      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
        {!imageError ? (
          <img 
            src={imageUrl}
            alt={community.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Users size={12} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu toggle button - only visible on small screens */}
      <button 
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-[12px] left-4 z-[100] p-2 rounded-md hover:bg-white/5"
        aria-label="Toggle navigation menu"
      >
        <Menu size={24} />
      </button>
      
      {/* Mobile overlay - only appears when sidebar is open on mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[89] transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Vertical divider line - hidden on mobile */}
      <div className={`hidden lg:block fixed top-[70px] ${collapsed ? 'left-[80px]' : 'left-[280px]'} w-[1px] h-[calc(100vh-70px)] bg-white/10 z-[95] transition-all duration-300`} />
      
      {/* Toggle button on the divider - hidden on mobile */}
      <button 
        className={`hidden lg:flex fixed top-1/2 ${collapsed ? 'left-[80px]' : 'left-[280px]'} w-[30px] h-[30px] rounded-full bg-base-300 border border-white/20 items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer z-[96] p-0 transition-all duration-300`}
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight className="text-base-content" size={20} /> : <ChevronLeft className="text-base-content" size={20} />}
      </button>
      
      <aside 
        ref={sidebarRef}
        className={`
          ${collapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-base-200 text-base-content p-6 flex flex-col gap-8 fixed top-0 lg:top-[70px] left-0 
          w-full h-full lg:h-[calc(100vh-70px)] overflow-hidden transition-all duration-300 ease-in-out 
          z-[90] backdrop-blur-sm shadow-2xl lg:shadow-none
        `}
        onMouseEnter={(e) => e.currentTarget.classList.replace("overflow-hidden", "overflow-auto")}
        onMouseLeave={(e) => e.currentTarget.classList.replace("overflow-auto", "overflow-hidden")}
      >
        {/* Mobile close button - Only visible on small screens */}
        <button
          className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Add extra padding for mobile to account for the status bar */}
        <div className="h-16 lg:hidden"></div>
        
        <nav className={`flex flex-col ${collapsed && !mobileOpen ? 'items-center' : 'items-start'} gap-4`}>
          <Link href="/" className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-start'} ${collapsed && !mobileOpen ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content font-medium text-lg hover:text-primary transition-colors ${collapsed && !mobileOpen ? 'hover:bg-white/5 rounded-lg p-2' : ''}`} onClick={() => setMobileOpen(false)}>
            <Home size={collapsed && !mobileOpen ? 26 : 20} className={collapsed && !mobileOpen ? 'transition-all duration-300' : ''} />
            {(!collapsed || mobileOpen) && "Home"}
          </Link>
          
          <Link href="/explore" className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-start'} ${collapsed && !mobileOpen ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed && !mobileOpen ? 'hover:bg-white/5 rounded-lg p-2' : ''}`} onClick={() => setMobileOpen(false)}>
            <Compass size={collapsed && !mobileOpen ? 26 : 20} className={collapsed && !mobileOpen ? 'transition-all duration-300' : ''} />
            {(!collapsed || mobileOpen) && "Explore"}
          </Link>
          
          <Link href="/trending" className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-start'} ${collapsed && !mobileOpen ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed && !mobileOpen ? 'hover:bg-white/5 rounded-lg p-2' : ''}`} onClick={() => setMobileOpen(false)}>
            <Flame size={collapsed && !mobileOpen ? 26 : 20} className={collapsed && !mobileOpen ? 'transition-all duration-300' : ''} />
            {(!collapsed || mobileOpen) && "Trending"}
          </Link>
          
          <Link href="/recent" className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-start'} ${collapsed && !mobileOpen ? 'w-10 h-10' : ''} btn btn-block gap-3 text-base-content text-lg hover:text-primary transition-colors ${collapsed && !mobileOpen ? 'hover:bg-white/5 rounded-lg p-2' : ''}`} onClick={() => setMobileOpen(false)}>
            <Clock12 size={collapsed && !mobileOpen ? 26 : 20} className={collapsed && !mobileOpen ? 'transition-all duration-300' : ''} />
            {(!collapsed || mobileOpen) && "Recent"}
          </Link>
        </nav>

        {(!collapsed || mobileOpen) && (
          <>
            <div className="divider my-1 before:bg-white/10 after:bg-white/10"></div>

            <div>
              <Link href="/hives" className="font-semibold mb-3 text-xl hover:text-primary transition-colors duration-150 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Users size={18} />
                Hives
              </Link>
              <div className="flex flex-col gap-3 mt-3">
                {loading ? (
                  <div className="flex justify-center py-3">
                    <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : communities.length > 0 ? (
                  communities.map(community => (
                    <Link
                      href={`/hives/${community._id}`}
                      key={community._id}
                      className="flex items-center gap-2 text-base-content hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      <CommunityAvatar community={community} />
                      <span className="truncate">{community.name}</span>
                      {community.isPrivate && (
                        <span className="badge badge-xs badge-warning">Private</span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm px-2">
                    No communities found. 
                    <Link href="/hives" className="text-primary ml-1 hover:underline" onClick={() => setMobileOpen(false)}>
                      Browse Hives
                    </Link>
                  </div>
                )}
                
                <Link href="/hives" className="text-primary text-sm hover:underline px-2 mt-1" onClick={() => setMobileOpen(false)}>
                  View all Hives
                </Link>
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

        {/* Show mini-icons for communities when collapsed - but not on mobile when sidebar is open */}
        {collapsed && !mobileOpen && (
          <div className="flex flex-col items-center gap-3 mt-4">
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
            ) : communities.length > 0 ? (
              communities.map(community => (
                <Link
                  href={`/hives/${community._id}`}
                  key={community._id}
                  className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center hover:ring-2 hover:ring-primary transition-all"
                  title={community.name}
                  onClick={() => setMobileOpen(false)}
                >
                  {/* Use the dedicated profile picture endpoint */}
                  {apiUrl ? (
                    <Image
                      src={`${apiUrl}/api/communities/${community._id}/profilePicture`}
                      alt={community.name}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 20C18 17.79 15.31 16 12 16C8.69 16 6 17.79 6 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9H9V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 19L17 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 15H17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <Users size={20} />
                  )}
                </Link>
              ))
            ) : (
              <Link href="/hives" className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30" title="Browse Hives" onClick={() => setMobileOpen(false)}>
                <Users size={20} className="text-primary" />
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;