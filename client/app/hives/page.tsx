"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { Users, Plus, Search } from 'lucide-react';
import Link from 'next/link';

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
  
  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch communities from the backend
  useEffect(() => {
    if (status === "authenticated") {
      fetchCommunities();
    }
  }, [status, searchQuery]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = searchQuery 
        ? `${apiUrl}/api/communities?search=${encodeURIComponent(searchQuery)}` 
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

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/communities/${communityId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join community');
      }

      // Update the local state to reflect the change
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, isJoined: true } 
            : community
        )
      );
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/communities/${communityId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave community');
      }

      // Update the local state to reflect the change
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, isJoined: false } 
            : community
        )
      );
    } catch (error) {
      console.error('Error leaving community:', error);
      alert('Failed to leave community. Please try again.');
    }
  };

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-base-content rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Main content - only shown to authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px] p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-base-content">Hives</h1>
              <Link 
                href="/hives/create" 
                className="flex items-center gap-2 bg-base-200 hover:bg-base-300 px-4 py-2 rounded-lg transition-colors"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-base-content"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div key={community._id} className="bg-base-100 rounded-2xl overflow-hidden shadow-lg">
                {/* Community Banner (using a placeholder since we don't know if bannerImage exists in the API response) */}
                <div className="h-32 bg-gradient-to-r from-primary/30 to-secondary/30 relative overflow-hidden">
                  {/* Placeholder for banner - in a real app you would check if community.bannerImage exists */}
                </div>
                
                {/* Community Info */}
                <div className="p-4 relative">
                  {/* Profile Picture/Icon */}
                  <div className="w-16 h-16 rounded-full bg-base-300 border-4 border-base-100 absolute -top-8 left-4 flex items-center justify-center overflow-hidden">
                    {/* You would check if community.profilePicture exists */}
                    <span className="text-lg font-bold">{community.name.charAt(0).toUpperCase()}</span>
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
                        className={`px-4 py-1 rounded-full text-sm font-medium ${
                          community.isJoined
                            ? 'bg-transparent border border-base-content text-base-content hover:bg-base-content/10'
                            : 'bg-primary hover:bg-primary/90 text-primary-content'
                        }`}
                      >
                        {community.isJoined ? 'Leave' : 'Join'}
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

          {/* Empty State */}
          {communities.length === 0 && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-base-200 p-4 rounded-full mb-4">
                <Users size={36} className="text-base-content/60" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Hives Found</h3>
              {searchQuery ? (
                <p className="text-base-content/70 max-w-md mb-4">No hives match your search criteria. Try a different search term or create a new hive.</p>
              ) : (
                <p className="text-base-content/70 max-w-md mb-4">There are no hives available yet. Be the first to create a new community!</p>
              )}
              <Link 
                href="/hives/create" 
                className="btn btn-primary"
              >
                Create a Hive
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 