'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Chat {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
  hasUnread?: boolean;
}

interface Contact {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  role?: string;
}

interface ChatMenuProps {
  onSelectChat: (chat: Chat) => void;
  userId: string;
  username: string;
  chats: Chat[];
}

// Generate a consistent color based on username
const getUsernameColor = (username: string) => {
  const colors = [
    'bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
    'bg-success', 'bg-warning', 'bg-error', 'bg-neutral'
  ];
  
  // Simple hash function to generate a consistent index
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

function ChatMenu({ onSelectChat, username, userId, chats = [] }: ChatMenuProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatList, setChatList] = useState<Chat[]>([]);
  
  useEffect(() => {
    // Fetch active contacts
    const fetchContacts = async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
          // Use relative URL instead of environment variable
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
          console.log('Fetching users from:', apiUrl);
          const response = await fetch(apiUrl, {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            // Transform API response to match our Contact interface
            const formattedContacts: Contact[] = data
              .filter((user: any) => user._id !== userId)
              .map((user: any) => ({
                id: user._id,
                name: user.name || user.username,
                username: user.username,
                profilePicture: '/images/user.png', // Use default avatar
                isOnline: true,
                role: user.role || 'Member'
              }));
            
            setContacts(formattedContacts);
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Failed to fetch contacts:', response.status, errorData);
          }
        } catch (error) {
          console.error('Error fetching contacts:', error);
        } finally {
          setIsLoading(false);
        }
      };

    fetchContacts();
  }, [userId]);

  // Add a function to fetch latest chats that can be called after sending a message
  const refreshChats = async () => {
    if (!userId) return;
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats?userId=${userId}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedChats: Chat[] = data.map((chat: any) => {
          const otherParticipant = chat.participants?.find((p: any) => p._id !== userId);
          
          return {
            id: chat._id,
            name: otherParticipant?.name || chat.name || 'Chat',
            username: otherParticipant?.username || 'user',
            profilePicture: '/images/user.png',
            hasUnread: chat.lastMessage && 
              !chat.lastMessage.readBy?.includes(userId) && 
              chat.lastMessage.senderId !== userId
          };
        });
        
        setChatList(formattedChats);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error refreshing chats:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  };

  // Filter chats and contacts based on search query
  const filteredChats = searchQuery 
    ? chatList.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const filteredContacts = searchQuery
    ? contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  // Create or get chat for a contact
  const handleContactClick = async (contact: Contact) => {
    try {
      // First, check if there's an existing chat with this user
      const existingChat = chatList.find(chat => chat.username === contact.username);
      
      if (existingChat) {
        // If chat exists, select it
        onSelectChat(existingChat);
      } else {
        // If not, create a new conversation
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversations`;
        console.log('Creating conversation at:', apiUrl);
        console.log('Request payload:', { userId, participantIds: [contact.id] });
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            participantIds: [contact.id]
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          const newChatData = await response.json();
          console.log('New chat created:', newChatData);
          // Transform API response to match our Chat interface
          const newChat: Chat = {
            id: newChatData._id,
            name: contact.name,
            username: contact.username,
            profilePicture: '/images/user.png' // Use default avatar
          };
          
          // Refresh the chats list to include the new chat
          await refreshChats();
          
          // Select the new chat
          onSelectChat(newChat);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to create chat:', response.status, errorData);
        }
      }
    } catch (error) {
      console.error('Error handling contact click:', error);
    }
  };

  // Define avatar component
  const Avatar = ({ src, online = false }: { src: string, online?: boolean }) => (
    <div className="avatar">
      <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-700">
        <Image 
          src={src} 
          alt="avatar" 
          width={40} 
          height={40} 
          className="object-cover" 
          unoptimized // Important for external URLs that might be API endpoints
        />
        {online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-gray-900"></span>
        )}
      </div>
    </div>
  );

  // HiveMind logo component with back button functionality
  const HiveMindLogo = () => (
    <Link href="/" className="flex items-center gap-2 mb-3 mt-1 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="avatar">
        <Image 
          src="/images/logo.png" 
          alt="HiveMind" 
          width={40} 
          height={40} 
        />
      </div>
      <div className="text-[28px]">
        <span className="text-base-content font-light">Hive</span>
        <span className="text-teal-500 font-bold">Mind</span>
      </div>
    </Link>
  );

  return (
    <div className="bg-base-200 h-full flex flex-col text-white">
      {/* Logo and search bar - fixed position */}
      <div className="px-10 py-3">
        <HiveMindLogo />
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="input input-bordered bg-base-300 w-full pl-10 border-0 focus:border-0 focus:outline focus:outline-1 focus:outline-gray-500 text-white rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Scrollable content container */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {/* Contacts section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Contacts</h3>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center gap-3 py-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleContactClick(contact)}
                >
                  <Avatar src={contact.profilePicture} online={contact.isOnline} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate text-white">{contact.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{contact.role || 'Member'}</p>
                  </div>
                  <div className={`${getUsernameColor(contact.username)} rounded-full px-2 py-0.5`}>
                    <span className="text-xs text-white font-medium whitespace-nowrap">#{contact.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p>No contacts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Divider between contacts and chats */}
        <div className="h-px bg-base-300 mx-4 my-2"></div>
        
        {/* Chats section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Chats</h3>
          </div>
          <div className="space-y-3">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => (
                <div 
                  key={chat.id}
                  className="flex items-center gap-3 py-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
                  onClick={() => onSelectChat(chat)}
                >
                  <Avatar src={chat.profilePicture} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate text-white">{chat.name}</h3>
                    <p className="text-xs text-gray-400 truncate">Software Engineer</p>
                  </div>
                  <div className={`${getUsernameColor(chat.username)} rounded-full px-2 py-0.5`}>
                    <span className="text-xs text-white font-medium">#{chat.username}</span>
                  </div>
                  {chat.hasUnread && (
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMenu;