'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatMenu from '@/components/chat/ChatMenu';
import ChatArea from '@/components/chat/ChatArea';
import { ArrowLeft, Link } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
  hasUnread?: boolean;
}

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>(undefined);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is typical md breakpoint
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Client-side authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting from chat page');
      router.push('/auth/signin?callbackUrl=/chat');
    } else if (status === 'authenticated' && session?.user?.id) {
      // Fetch user's conversations
      fetchUserChats(session.user.id);
    }
  }, [status, router]);

  const fetchUserChats = async (userId: string) => {
    try {
      // Use relative URL
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats?userId=${userId}`;
      console.log('Fetching chats from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Chats received:', data);
        
        // Transform API response to match our Chat interface
        const formattedChats: Chat[] = data.map((chat: any) => {
          // Find the participant that is not the current user
          const otherParticipant = chat.participants?.find((p: any) => p._id !== userId);
          
          return {
            id: chat._id,
            name: otherParticipant?.name || chat.name || 'Chat',
            username: otherParticipant?.username || 'user',
            profilePicture: '/images/user.png', // Use default avatar
            hasUnread: chat.lastMessage && 
              !chat.lastMessage.readBy?.includes(userId) && 
              chat.lastMessage.senderId !== userId
          };
        });
        
        setChats(formattedChats);
      } else {
        console.error('Failed to fetch chats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Handle chat selection from ChatMenu
  const handleChatSelect = useCallback((chat: Chat) => {
    setSelectedChat(chat);
  }, []);

  // Go back to chat list (for mobile view)
  const handleBackToList = useCallback(() => {
    setSelectedChat(undefined);
  }, []);

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <section className='bg-base-200 min-h-screen w-screen flex justify-center items-center'>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Loading chat...</p>
        </div>
      </section>
    );
  }

  // Prevent rendering if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect in the useEffect
  }

  // Handle current user profile picture
  let currentUserProfilePic = session?.user?.image || '/images/user.png';
  
  // If it's a buffer reference and not a URL, construct the API URL
  if (session?.user?.id && (!currentUserProfilePic.startsWith('http'))) {
    currentUserProfilePic = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/profile-picture`;
  }

  const currentUser = {
    id: session?.user?.id || '',
    username: session?.user?.name || '',
    profilePicture: currentUserProfilePic,
  };

  // On mobile: show either chat list or chat area, not both
  if (isMobileView) {
    return (
      <section className='bg-base-100 min-h-screen flex flex-col'>
        {selectedChat ? (
          // Mobile chat view with back button
          <>
            <div className="absolute top-6 left-0">
              <button  
                className="btn btn-ghost btn-sm" 
                onClick={handleBackToList}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="flex-1">
              <ChatArea selectedChat={selectedChat} currentUser={currentUser} />
            </div>
          </>
        ) : (
          // Mobile chat list view
          <div className="flex-1">
            <div className="absolute top-6 left-0">
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => router.push('/')}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <ChatMenu 
              onSelectChat={handleChatSelect}
              userId={currentUser.id}
              username={currentUser.username}
              chats={chats}
            />
          </div>
        )}
      </section>
    );
  }

  // Desktop view: show both sidebar and chat area
  return (
    <section className='bg-base-200 min-h-screen flex h-screen overflow-hidden'>
      {/* Chat menu sidebar - correctly sized and scrollable */}
      <div className="w-96 h-full overflow-hidden border-r border-base-300">
        <ChatMenu 
          onSelectChat={handleChatSelect}
          userId={currentUser.id}
          username={currentUser.username}
          chats={chats}
        />
      </div>
      
      {/* Vertical divider line */}
      <div className="w-px h-full bg-base-300"></div>
      
      {/* Chat area main content - takes remaining space with its own scrolling */}
      <div className="flex-1 h-full overflow-hidden">
        <ChatArea 
          selectedChat={selectedChat} 
          currentUser={currentUser} 
        />
      </div>
    </section>
  );
}