'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus } from 'lucide-react';

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
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            // Transform API response to match our Contact interface
            const formattedContacts: Contact[] = data
              .filter((user: any) => user._id !== userId)
              .map((user: any) => ({
                id: user._id,
                name: user.name || user.username,
                username: user.username,
                profilePicture: '/default-avatar.png', // Use default avatar for now
                isOnline: true,
                role: user.role || 'Member'
              }));
            
            setContacts(formattedContacts);
          } else {
            console.error('Failed to fetch contacts:', response.status);
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
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        const formattedChats: Chat[] = data.map((chat: any) => {
          const otherParticipant = chat.participants?.find((p: any) => p._id !== userId);
          
          return {
            id: chat._id,
            name: otherParticipant?.name || chat.name || 'Chat',
            username: otherParticipant?.username || 'user',
            profilePicture: '/default-avatar.png',
            hasUnread: chat.lastMessage && 
              !chat.lastMessage.readBy?.includes(userId) && 
              chat.lastMessage.senderId !== userId
          };
        });
        
        setChatList(formattedChats);
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
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantIds: [userId, contact.id]
          })
        });
        
        if (response.ok) {
          const newChatData = await response.json();
          console.log('New chat created:', newChatData);
          // Transform API response to match our Chat interface
          const newChat: Chat = {
            id: newChatData._id,
            name: contact.name,
            username: contact.username,
            profilePicture: '/default-avatar.png' // Use default avatar for now
          };
          
          // Refresh the chats list to include the new chat
          await refreshChats();
          
          // Select the new chat
          onSelectChat(newChat);
        } else {
          console.error('Failed to create chat:', response.status);
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

  return (
    <div className="bg-base-200 h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
        </div>
      </div>

      {/* Contacts section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-base-content/70">Active Contacts</h3>
          <button className="btn btn-ghost btn-xs">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div 
                key={contact.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
                onClick={() => handleContactClick(contact)}
              >
                <Avatar src={contact.profilePicture} online={contact.isOnline} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{contact.name}</h3>
                  <p className="text-xs text-base-content/60 truncate">{contact.role || 'User'}</p>
                </div>
                <div className="bg-primary rounded-full px-2 py-0.5">
                  <span className="text-xs text-primary-content font-medium">#{contact.username}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-base-content/50">
              <p>No contacts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider px-4 my-0"></div>
      
      {/* Chats section */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-base-content/70">Conversations</h3>
          <button className="btn btn-ghost btn-xs">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <div 
                key={chat.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
                onClick={() => onSelectChat(chat)}
              >
                <div className="relative">
                  <Avatar src={chat.profilePicture} />
                  {chat.hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                      •
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{chat.name}</h3>
                  <p className="text-xs text-base-content/60 truncate">Tap to view conversation</p>
                </div>
                <div className="bg-neutral rounded-full px-2 py-0.5">
                  <span className="text-xs text-neutral-content font-medium">#{chat.username}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-base-content/50">
              <p>No conversations yet</p>
              <p className="text-xs">Start chatting with a contact!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMenu;