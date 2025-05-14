'use client';
import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import useSession
import { PenLine, Eye, Users, Lock, ImageIcon } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Navbar';

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session } = useSession(); // Get session data and status
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'Communities' | 'private'>('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Handle dropdown visibility
  const toggleDropdown = () => setShowDropdown((v) => !v);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    // Generate previews
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(setImagePreviews);
  };

  // Remove a selected image
  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Handler for form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === 'loading') {
      console.log('Authentication status loading...');
      // Optionally, show a loading indicator to the user
      return; // Prevent submission while loading
    }

    if (status !== 'authenticated' || !session?.accessToken) {
      console.error('User not authenticated or token not available.');
      // Optionally, redirect to login or show an error message to the user
      // Example: router.push('/auth/login');
      alert('You must be logged in to create a post.');
      return;
    }

    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('content', content);
    formData.append('visibility', visibility);
    images.forEach((img) => {
      formData.append('images', img);
    });
    // Implement form submission logic here
    console.log('Form submitted:', { heading, content, visibility, images });
    // Example: await fetch('/api/posts', { method: 'POST', body: formData });

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/posts', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`, // Use token from session
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Post created:', data);
      router.push('/posts');
    } else {
      console.error('Error creating post:', response.statusText);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      
        <Header />


        <section>
<main className="flex-1 flex items-center justify-center px-4 py-12 pt-20">

<div className="w-full max-w-2xl px-4 sm:px-6 overflow-hidden inset-0">
  <div className="flex items-center gap-4 mb-6">
    <div className="text-primary-content p-3 rounded-lg shadow-sm">
      <PenLine className="h-7 w-7 text-teal-400" size={24} />
    </div>
    <div>
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Create New Post</h1>
      <p className="text-base-content/70 mt-1">Share your thoughts with the community</p>
    </div>
  </div>
  
  <form onSubmit={handleSubmit} className="space-y-6 card bg-base-100 shadow-xl p-6">
    {/* Heading */}
    <div className="form-control">
      <label className="block text-lg mb-2 text-teal-400 font-bold">Heading</label>
      <input
        type="text"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="input input-bordered w-full focus:input-primary transition"
        placeholder="Add a heading for your post"
      />
      <p className="text-base-content/60 text-sm mt-1">Be descriptive and concise</p>
    </div>
    
    {/* Content */}
    <div className="form-control">
      <label className="block text-lg mb-2 text-teal-400 font-bold">Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="textarea textarea-bordered w-full focus:textarea-primary transition"
        placeholder="What's on your mind?"
      ></textarea>
      <p className="text-base-content/60 text-sm mt-1">Share your thoughts, ideas, or questions</p>
    </div>
    
    {/* Visibility */}
    <div className="form-control" ref={dropdownRef}>
      <label className="block text-lg mb-2 text-teal-400 font-bold">Visibility</label>
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full input input-bordered bg-base-100 text-base-content focus:input-primary transition"
        >
          <div className="flex items-center">
            {visibility === 'public' && <Eye className="w-5 h-5 mr-2" />} 
            {visibility === 'Communities' && <Users className="w-5 h-5 mr-2" />} 
            {visibility === 'private' && <Lock className="w-5 h-5 mr-2" />} 
            <span className="capitalize">{visibility.replace('_', ' ')}</span>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg">
            <ul>
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full px-4 py-2 hover:bg-primary/10 text-left ${visibility === 'public' ? 'text-primary font-semibold' : ''}`}
                  onClick={() => { setVisibility('public'); setShowDropdown(false); }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Public
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full px-4 py-2 hover:bg-primary/10 text-left ${visibility === 'Communities' ? 'text-primary font-semibold' : ''}`}
                  onClick={() => { setVisibility('Communities'); setShowDropdown(false); }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Communities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full px-4 py-2 hover:bg-primary/10 text-left ${visibility === 'private' ? 'text-primary font-semibold' : ''}`}
                  onClick={() => { setVisibility('private'); setShowDropdown(false); }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Private
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <p className="text-base-content/60 text-sm mt-1">Who can see this post?</p>
    </div>
    
    {/* Image Upload */}
    <div className="form-control">
      <label className="block text-lg mb-2 text-teal-400 font-bold">Image (Optional)</label>
      <div 
        className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-lg p-12 cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          {/* Removed conflicting class 'text-base-content/60' */}
          <ImageIcon size={42} className="mb-3 text-teal-400" /> 
          {/* Removed conflicting class 'text-base-content/60' */}
          <p className="text-teal-400">Click to upload image(s)</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      {/* Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative group">
              {/* Consider using Next.js Image component for optimization if this is a Next.js project */}
              {/* For now, keeping img tag as is, but be mindful of Next.js recommendations */}
              <img src={src} alt={`Preview ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-base-300" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition group-hover:scale-110"
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-base-content/60 text-sm mt-1">Supported: JPG, PNG (max 1MB each)</p>
    </div>
    
    {/* Action Buttons */}
    <div className="flex justify-end space-x-3 mt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="btn btn-ghost"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn-soft btn-primary"
      >
        Create Post
      </button>
    </div>
  </form>
  
  <div className="text-center text-sm text-base-content/60 mt-8">
    <p>All posts are subject to our community guidelines</p>
  </div>
</div>
</main>
</section>


            <Footer />
    </div>
  );
}