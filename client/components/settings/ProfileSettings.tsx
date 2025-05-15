'use client';
import { useState } from 'react';
import Image from 'next/image';
import { User, Pencil, Check, Palette, Sparkles, BookImage, UserPen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export default function ProfileSettings() {
  // State management
  const [displayName, setDisplayName] = useState('maad9110');
  const [about, setAbout] = useState('');
  const [bannerColor, setBannerColor] = useState('bg-cyan-500');
  const [saved, setSaved] = useState(false);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<File | string>('/images/user.png');
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const formData = new FormData();
    formData.append('name', displayName); // Changed from displayName to name
    formData.append('bio', about); // Changed from about to bio
    formData.append('bannerColor', bannerColor);

    if (profilePicture instanceof File) {
      formData.append('profilePicture', profilePicture);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/profileUpdate`, {
      method: 'PUT',
      // Headers are set automatically by the browser for FormData
      body: formData,
    });

    if (res.ok) {
      console.log('Profile updated successfully');
      setSaved(true);
      // Optionally, refresh user data or update profilePicture state with new URL if backend returns it
      // For simplicity, we'll rely on next fetch or a page refresh to show server-persisted image.
      // If the backend returns the new image URL or a flag, you can update `profilePicture` state here.
      // Example: const data = await res.json(); if (data.user.hasProfilePicture) setProfilePicture(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/profilePicture?timestamp=${new Date().getTime()}`);
    } else {
      console.error('Failed to update profile');
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setDisplayName(value);
    }
  };

  const getUserData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setLoading(true); // Ensure loading is true at the start
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log('User data:', data);
      setDisplayName(data.name || '');
      setAbout(data.bio || '');
      setBannerColor(data.bannerColor || 'bg-cyan-500');      if (data.hasProfilePicture) {
        // Add a timestamp to break cache
        setProfilePicture(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/profilePicture?timestamp=${new Date().getTime()}`);
      } else {
        setProfilePicture('/images/user.png');
      }
    } else {
      console.error('Failed to fetch user data');
      setProfilePicture('/images/user.png'); // Fallback
    }
    setLoading(false);
  };

  const colors = [
    'bg-cyan-500', // Cyan
    'bg-violet-500', // Violet
    'bg-pink-500', // Pink
    'bg-orange-500', // Amber
    'bg-green-500', // Emerald
  ];
  // Fetch user data when the component mounts
  useEffect(() => {
    getUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

    useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      getUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false); // Not logged in, stop loading
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id]);


  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file); // Store the File object for upload
      setSaved(false); // Reset saved state as changes are made
    }
  };

  // Show loading state during authentication check
  if (loading) {
    return (
      <section className='bg-base-100 min-h-screen w-screen bg-gradient-to-br flex justify-center items-center'>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </section>
    );
  }

  return(
    <div className="min-h-screen bg-black text-zinc-200 p-4 md:p-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleProfilePictureChange}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <UserPen className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Profile 
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Manage your User Profile
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Glassy Card */}
        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] transition-all duration-300 space-y-10">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left: Editable Fields */}
            <div className="md:col-span-2 space-y-8">
              {/* Avatar */}
                    <div 
                      className="relative -mt-10 mb-3 flex justify-center cursor-pointer"
                      onClick={handleImageClick} // Make the area clickable
                    >
                      <div className="relative">
                        <Image
                          src={profilePicture instanceof File ? URL.createObjectURL(profilePicture) : profilePicture}
                          alt="Avatar"
                          width={64}
                          height={64}
                          className="rounded-full border-4 border-zinc-900 bg-zinc-800 object-cover"
                          onError={() => setProfilePicture('/images/user.png')} // Fallback for broken images
                        />
                        <div // Changed button to div, click handled by parent
                          className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-1 border-2 border-zinc-900"
                        >
                          <Pencil size={12} color="white"/>
                        </div>
                      </div>
                    </div>
              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="displayName" className="flex items-center gap-2 text-white font-medium">
                  <User className="h-7 w-7 text-teal-400 size-18" />
                  Display Name
                </label>
                <p className="text-xs text-zinc-400">This is how others will see you (max 10 characters)</p>
                <div>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    maxLength={10}
                    className="input input-bordered input-lg w-full bg-zinc-900 border-teal-700 text-white"
                  />
                  <div className="text-xs text-zinc-500 text-right mt-1">
                    {displayName.length}/10
                  </div>
                </div>
              </div>
              {/* Banner Color */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white font-medium">
                  <Palette size={18} className="h-7 w-7 text-teal-400"/>
                  Banner Color
                </label>
                <p className="text-xs text-zinc-400">Choose a color for your profile banner</p>
                <div className="flex gap-3 mt-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-all relative ${color} ${bannerColor === color ? 'border-teal-400' : 'border-transparent'}`}
                      onClick={() => setBannerColor(color)}
                    >
                      {bannerColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check size={16} color="white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {/* About Me */}
              <div className="space-y-2">
                <label htmlFor="about" className="flex items-center gap-2 text-white font-medium">
                  <BookImage size={18} className="h-7 w-7 text-teal-400"/>
                  About Me
                </label>
                <p className="text-xs text-zinc-400">You can use markdown and links if you&apos;d like</p>
                <textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={8}
                  maxLength={190}
                  className="textarea textarea-bordered textarea-lg w-full bg-zinc-900 border-teal-700 text-white resize-none"
                />
                <div className="text-right text-xs text-zinc-500">{190 - about.length} characters remaining</div>
              </div>
              {/* Decorations Section */}
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={18} className="text-teal-400" />
                </div>
              </div>
            </div>
            {/* Right: Profile Preview */}
            <div className="space-y-6">
              <div className="sticky top-8">
                {/* Preview Title */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-white">Preview</h3>
                  <p className="text-zinc-400 text-sm">How others will see your profile</p>
                </div>
                {/* Profile Card Preview */}
                <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 overflow-hidden">
                  {/* Banner */}
                  <div
                    className={`w-full h-20 ${bannerColor}`}/>
                  {/* Profile Content */}
                  <div className="p-4">
                    {/* Avatar */}
                    <div className="relative -mt-10 mb-3 flex justify-center">
                      <div className="relative">
                        <Image
                          src={profilePicture as string}
                          alt="Avatar"
                          width={64}
                          height={64}
                          className="rounded-full border-4 border-zinc-900 bg-zinc-800"
                        />
                        <button 
                          type="button"
                          className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-1 border-2 border-zinc-900"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>
                    {/* Display Name and Username */}
                    <div className="text-center mt-2">
                      <div className="text-lg font-bold text-white">{displayName || 'Your Name'}</div>
                      <div className="text-zinc-400 text-xs">hammadahmed9110</div>
                    </div>
                    {/* About Me Section */}
                    {about && (
                      <div className="mt-3 p-2 bg-zinc-800/50 rounded-lg text-zinc-300 text-xs">
                        {about}
                      </div>
                    )}
                    {/* Example Button */}
                    <div className="mt-3 flex justify-center">
                      <button 
                        type="button"
                        className="btn btn-outline btn-sm border-teal-700 text-teal-400 hover:bg-teal-900 hover:border-teal-600"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
                {/* Nameplate Preview */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5 border border-zinc-700">
                    <Image 
                      src={profilePicture instanceof File ? URL.createObjectURL(profilePicture) : profilePicture} 
                      alt="Avatar" 
                      width={18} 
                      height={18} 
                      className="rounded-full object-cover"
                      onError={() => setProfilePicture('/images/user.png')} // Fallback
                    />
                    <span className="text-white text-sm font-medium">{displayName || 'Your Name'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`btn btn-primary px-6 py-2.5 rounded-lg font-medium text-white transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20 
                ${saved
                  ? 'bg-emerald-500 hover:bg-emerald-600 border-none'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 border-none shadow-lg shadow-teal-500/20'
                }`}
            >
              <div className="flex items-center gap-2">
                {saved ? (
                  <>
                    <Check size={16} />
                    <span>Profile Saved</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
      {/* Subtle background elements */}
      <div className="fixed -top-48 -right-48 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-48 -left-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}