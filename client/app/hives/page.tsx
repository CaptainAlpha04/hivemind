"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { Users, Plus, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';

// Interface for Community data
interface Community {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    username: string;
    profilePicture?: {
      data?: string;
      contentType?: string;
    }
  };
  profilePicture?: {
    data?: string;
    contentType?: string;
  };
  bannerImage?: {
    data?: string;
    contentType?: string;
  };
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isJoined?: boolean;
}

export default function HivesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joiningHive, setJoiningHive] = useState<string | null>(null);
  
  // Use debounced callback for search
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      fetchCommunities(query);
    },
    500
  );
  
  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch communities from the backend on initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchCommunities();
    }
  }, [status]);

  const fetchCommunities = async (query: string = '') => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = query 
        ? `${apiUrl}/api/communities?search=${encodeURIComponent(query)}` 
        : `${apiUrl}/api/communities`;
      
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }

      const data = await response.json();
      setCommunities(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setError('Failed to load communities. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      setJoiningHive(communityId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/communities/${communityId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({ userId: session?.user?.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to join hive');
      }

      // Update the local state to reflect the change
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, isJoined: true } 
            : community
        )
      );
      toast.success('Successfully joined the hive!');
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast.error(error.message || 'Failed to join hive. Please try again.');
    } finally {
      setJoiningHive(null);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      setJoiningHive(communityId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/communities/${communityId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({ userId: session?.user?.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to leave hive');
      }

      // Update the local state to reflect the change
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, isJoined: false } 
            : community
        )
      );
      toast.success('Successfully left the hive.');
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast.error(error.message || 'Failed to leave hive. Please try again.');
    } finally {
      setJoiningHive(null);
    }
  };

  // Convert base64 data to a URL (similar to feed.tsx)
  const convertBase64ToUrl = (base64String: any, contentType: string): string => {
    try {
      // Check if base64String is null or undefined
      if (!base64String) {
        return '';
      }
      
      // Convert Buffer or object to string if needed
      let dataString = base64String;
      
      // If it's a Buffer or object, convert to string
      if (typeof base64String === 'object') {
        try {
          // If it has a toString method (like Buffer), use it
          dataString = base64String.toString('base64');
        } catch (err) {
          console.error("Error converting object to string:", err);
          return '';
        }
      }
      
      // Now dataString should be a string, check if it already has the data URL prefix
      if (typeof dataString === 'string' && dataString.includes('base64,')) {
        return dataString;
      }
      
      // Otherwise, add the appropriate data URL prefix
      return `data:${contentType};base64,${dataString}`;
    } catch (error) {
      console.error("Error converting base64 to data URL:", error);
      return ''; // Return empty string on error
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-300 to-base-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl p-8 flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Loading your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main content - only shown to authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-300 to-base-100">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px] p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary bg-opacity-20 p-3 rounded-lg shadow-sm">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-base-content">Hives</h1>
              </div>
              <Link 
                href="/hives/create" 
                className="btn btn-primary btn-md gap-2"
              >
                <Plus size={18} />
                <span>Create Hive</span>
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="relative bg-base-200 rounded-lg w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-base-content/60" />
              </div>
              <input
                type="text"
                placeholder="Search hives..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-base-content"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 size={16} className="text-primary animate-spin" />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isLoading && !error && (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={40} className="text-primary animate-spin" />
            </div>
          )}

          {/* Communities Grid */}
          {!isLoading && !error && communities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <div key={community._id} className="bg-base-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Community Banner */}
                  <div className="h-32 relative overflow-hidden">
                    {community.bannerImage && community.bannerImage.data ? (
                      <img 
                        src={convertBase64ToUrl(
                          community.bannerImage.data,
                          community.bannerImage.contentType || 'image/jpeg'
                        )} 
                        alt={`${community.name} banner`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-primary/30 to-secondary/30"></div>
                    )}
                  </div>
                  
                  {/* Community Info */}
                  <div className="p-4 relative">
                    {/* Profile Picture/Icon */}
                    <div className="w-16 h-16 rounded-full bg-base-300 border-4 border-base-100 absolute -top-8 left-4 flex items-center justify-center overflow-hidden">
                      {community.profilePicture && community.profilePicture.data ? (
                        <img 
                          src={convertBase64ToUrl(
                            community.profilePicture.data,
                            community.profilePicture.contentType || 'image/jpeg'
                          )} 
                          alt={`${community.name} profile`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, fallback to text initial
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const span = document.createElement('span');
                              span.className = 'text-lg font-bold';
                              span.textContent = community.name.charAt(0).toUpperCase();
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-lg font-bold">{community.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-bold">{community.name}</h3>
                      <p className="text-base-content/70 text-sm mt-1 line-clamp-2">{community.description}</p>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-base-content/60">
                          Created {new Date(community.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => community.isJoined 
                            ? handleLeaveCommunity(community._id) 
                            : handleJoinCommunity(community._id)
                          }
                          disabled={joiningHive === community._id}
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            joiningHive === community._id 
                              ? 'opacity-70 cursor-not-allowed'
                              : community.isJoined
                                ? 'bg-transparent border border-base-content text-base-content hover:bg-base-content/10'
                                : 'bg-primary hover:bg-primary/90 text-primary-content'
                          }`}
                        >
                          {joiningHive === community._id ? (
                            <span className="flex items-center">
                              <Loader2 size={14} className="mr-1 animate-spin" />
                              {community.isJoined ? 'Leaving...' : 'Joining...'}
                            </span>
                          ) : (
                            community.isJoined ? 'Leave' : 'Join'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* View Community Link */}
                  <Link 
                    href={`/hives/${community._id}`} 
                    className="block w-full py-3 text-center border-t border-base-200 hover:bg-base-200 transition-colors"
                  >
                    View Hive
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {communities.length === 0 && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-base-200 rounded-xl shadow-lg">
              <div className="bg-base-300/50 p-6 rounded-full mb-6">
                <Users size={40} className="text-base-content/60" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Hives Found</h3>
              {searchQuery ? (
                <p className="text-base-content/70 max-w-md mb-6">
                  No hives match your search criteria. Try a different search term or create a new hive.
                </p>
              ) : (
                <p className="text-base-content/70 max-w-md mb-6">
                  There are no hives available yet. Be the first to create a new community!
                </p>
              )}
              <Link 
                href="/hives/create" 
                className="btn btn-primary btn-lg"
              >
                <Plus size={18} className="mr-1" />
                Create a Hive
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}