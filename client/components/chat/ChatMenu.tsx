'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function ChatMenu() {
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Fetch contacts (active users)
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`); //  Update this endpoint to fetch active contacts
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          console.error('Failed to fetch contacts:', response.status);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    // Fetch chats (recent conversations)
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats'); //  Update this endpoint to fetch recent chats
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        } else {
          console.error('Failed to fetch chats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchContacts();
    fetchChats();
  }, []);

  // Define prop types for components
  interface AvatarProps {
    src: string;
    online?: boolean;
  }

  interface ContactItemProps {
    contact: {
      _id: string;
      name: string;
      role: string;
      username: string;
      usernameColor: string;
      isOnline: boolean;
      avatar: string;
    };
  }

  interface ChatItemProps {
    chat: {
      _id: string;
      name: string;
      role: string;
      username: string;
      usernameColor: string;
      hasUnread: boolean;
      avatar: string;
    };
  }

  // This is just a temporary placeholder component until you have actual avatar images
  const Avatar: React.FC<AvatarProps> = ({ src, online = false }) => (
    <div className="avatar">
      <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-700">
        {src ? (
          <Image src={src} alt="avatar" width={40} height={40} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        {online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-gray-900"></span>
        )}
      </div>
    </div>
  );

  const ContactItem: React.FC<ContactItemProps> = ({ contact }) => (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
      <Avatar src={contact.avatar} online={contact.isOnline} />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white">{contact.name}</h3>
        <p className="text-xs text-gray-400">{contact.role}</p>
      </div>
      <div className={`${contact.usernameColor} rounded-full px-2 py-0.5`}>
        <span className="text-xs text-white font-medium">#{contact.username}</span>
      </div>
    </div>
  );

  const ChatItem: React.FC<ChatItemProps> = ({ chat }) => (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
      <div className="relative">
        <Avatar src={chat.avatar} online={false} />
        {chat.hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
            •
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white">{chat.name}</h3>
        <p className="text-xs text-gray-400">{chat.role}</p>
      </div>
      <div className={`${chat.usernameColor} rounded-full px-2 py-0.5`}>
        <span className="text-xs text-white font-medium">#{chat.username}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-base-300 m-5 text-white w-96 rounded-xl fixed flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Active</h3>
          <div className="space-y-1">
            {contacts.map(contact => (
              <ContactItem key={Math.random()} contact={contact} />
            ))}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="space-y-1">
          {chats.map(chat => (
            <ChatItem key={Math.random()} chat={chat} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatMenu;