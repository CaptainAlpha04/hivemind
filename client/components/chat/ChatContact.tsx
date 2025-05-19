'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Contact {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  role?: string;
  bannerColor?: string;
}

interface ChatContactProps {
  contact: Contact;
  onClick: () => void;
}

const ChatContact = ({ contact, onClick }: ChatContactProps) => {
  const [imageUrl, setImageUrl] = useState<string>('/images/user.png'); // Default image
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Only attempt to load the profile picture from API if it's not already an http URL
    // and we haven't had an error loading it
    if (!imageError && contact.id) {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${contact.id}/profilePicture`;
      setImageUrl(apiUrl);
    }
  }, [contact.id, imageError]);

  const handleImageError = () => {
    console.log(`Failed to load profile picture for ${contact.name}`);
    setImageError(true);
    setImageUrl('/images/user.png'); // Fallback to default image
  };

  return (
    <div 
      className="flex items-center gap-3 py-2 px-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Avatar component */}
      <div className="avatar">
        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-700">
          <Image 
            src={imageUrl}
            alt={`${contact.name}'s avatar`}
            width={40}
            height={40}
            className="object-cover"
            onError={handleImageError}
            unoptimized // Important for external URLs that might be API endpoints
          />
          {contact.isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-gray-900"></span>
          )}
        </div>
      </div>
      
      {/* User info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate text-white">{contact.name}</h3>
        <p className="text-xs text-gray-400 truncate">{contact.role || 'Member'}</p>
      </div>
      
      {/* Username tag */}
      <div className={`${contact.bannerColor} rounded-full px-2 py-0.5`}>
        <span className="text-xs text-white font-medium whitespace-nowrap">#{contact.username}</span>
      </div>
    </div>
  );
};

export default ChatContact;