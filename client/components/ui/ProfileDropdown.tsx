"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";

interface UserDataProp {
  id: string;
  name: string;
  email: string;
  username: string;
  hasProfilePicture: boolean;
  profilePicture?: string;
  image?: string;
  bannerColor?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  blockedUserIds: string[];
  settings: {
    receiveEmailNotifications: boolean;
    theme: string;
  };
}

const ProfileDropdown = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserDataProp | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('/images/user.png');
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [ringColor, setRingColor] = useState<string | undefined>('cyan-500');

  useEffect(() => {
    if (isSigningOut && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, isSigningOut, router]);
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserDetails();
      if (data) {
        setUserData(data);

        if (data.bannerColor) {
        const ringColor = data.bannerColor.replace("bg-", "");
        console.log("Ring color:", ringColor);
        setRingColor(ringColor);
      }
        // Handle the profile picture if it exists
        if (data.hasProfilePicture && data.profilePicture) {
          try {
            // Convert the blob data to a URL
            const blob = convertBase64ToBlob(data.profilePicture);
            const imageUrl = URL.createObjectURL(blob);
            setProfileImageUrl(imageUrl);
          } catch (error) {
            console.error("Error converting profile picture:", error);
            // Fallback to default avatar
            setProfileImageUrl('/images/user.png');
          }
        } else if (data.image) {
          // If there's an image URL available but no blob data
          setProfileImageUrl(data.image);
        }
      } else {
        console.error("Failed to fetch user data");
      }
    };
    
    fetchData();
    
    // Cleanup function to revoke object URLs
    return () => {
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };


  }, []);

  const convertBase64ToBlob = (base64String: string): Blob => {
    // Remove potential data URL prefix
    const base64Data = base64String.includes('base64,') 
      ? base64String.split('base64,')[1] 
      : base64String;
    
    try {
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: 'image/jpeg' });
    } catch (error) {
      console.error("Error converting base64 to blob:", error);
      throw error;
    }
  };

  const getUserDetails = async () => {
    if (!session?.user?.id) {
      console.error("User ID is not available");
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("User details:", data);
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
  };
  
  // No need to use useState with DaisyUI's dropdown
  return (
    <div className="dropdown dropdown-end ml-2 bg-base-100 z-index-50 text-base-content">
      {/* The button that opens the dropdown - using details/summary for better accessibility */}
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar online">
        <div className={`w-10 h-10 rounded-full ring ring-offset-base-200 ring-offset-2 ${
    ringColor === 'orange-500' ? 'ring-orange-500' :
    ringColor === 'pink-500' ? 'ring-pink-500' :
    ringColor === 'green-500' ? 'ring-emerald-500' :
    ringColor === 'violet-500' ? 'ring-purple-500' :
    'ring-cyan-500'}`}>
          <img src={profileImageUrl || '/images/user.png'} alt="profile" />
        </div>
      </label>
      
      <ul tabIndex={0} className="dropdown-content z-[1] bg-base-200 menu p-3 shadow-lg rounded-box w-52 mt-2">
        <div className="px-2 py-2 mb-2 border-b border-white/10">
          <div className="font-semibold text-base">{userData?.name}</div>
          <div className={`${userData?.bannerColor} badge text-xs`}>{userData?.username}</div>
        </div>
        <li>
          <Link href="/user" className="flex items-center hover:text-primary hover:hover:bg-gray-700/20">
            <User size={16} />
            Profile
          </Link>
        </li>
        <li>
          <Link href="/settings/account" className="flex items-center hover:text-primary hover:bg-gray-700/20">
            <Settings size={16} />
            Settings
          </Link>
        </li>
        <li>
            <button
            onClick={() => {
              handleSignOut();
            }}
            className="flex items-center hover:text-primary hover:bg-gray-700/20"
            >
            <LogOut size={16} />
            Logout
            </button>
        </li>
          <li>
            <ThemeSwitch />
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;