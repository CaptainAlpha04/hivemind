import React from 'react'
import Image from 'next/image'

function ChatMenu() {
  // Dummy data that we'll replace later
  const contacts = [
    { id: 1, name: 'Sara Williams', role: 'Senior Consultant', username: 'catalyst01', usernameColor: 'bg-pink-500', isOnline: true, avatar: '/avatars/sara.jpg' },
    { id: 2, name: 'Artemis Salidius', role: 'Finance Advisor', username: 'DespairDad', usernameColor: 'bg-indigo-500', isOnline: false, avatar: '/avatars/artemis.jpg' },
    { id: 3, name: 'Franky', role: 'Student', username: 'Keeper007', usernameColor: 'bg-green-700', isOnline: false, avatar: '/avatars/franky.jpg' },
  ];

  const chats = [
    { id: 1, name: 'Raj Vishal', role: 'Software Engineer', username: 'CheeniIB', usernameColor: 'bg-red-600', hasUnread: true, avatar: '/avatars/raj.jpg' },
    { id: 2, name: 'Michael Smith', role: 'Jr Photographer', username: 'sigmc32', usernameColor: 'bg-blue-800', hasUnread: false, avatar: '/avatars/michael.jpg' },
    { id: 3, name: 'Judy Ju', role: 'UX/UI Apprentice', username: 'Jujistu1', usernameColor: 'bg-green-700', hasUnread: false, avatar: '/avatars/judy.jpg' },
    { id: 4, name: 'David Harbour', role: 'Actor', username: 'DavidHb', usernameColor: 'bg-blue-900', hasUnread: true, avatar: '/avatars/david.jpg' },
    { id: 5, name: 'Charity Mill', role: 'Fashion Designer', username: 'HeartSage', usernameColor: 'bg-pink-600', hasUnread: false, avatar: '/avatars/charity.jpg' },
    { id: 6, name: 'Yasin Alma\'ar', role: 'Mechanical Engineer', username: 'unknown12', usernameColor: 'bg-orange-500', hasUnread: false, avatar: '/avatars/yasin.jpg' },
  ];

  // Define prop types for components
  interface AvatarProps {
    src: string;
    online?: boolean;
  }

  interface ContactItemProps {
    contact: {
      id: number;
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
      id: number;
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
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="space-y-1">
          {chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatMenu;