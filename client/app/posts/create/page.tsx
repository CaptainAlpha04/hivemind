'use client';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PenLine, Eye, Users, Lock, ImageIcon, X, ChevronDown, Hash } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'Communities' | 'private'>('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const communityDropdownRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communities, setCommunities] = useState<{id: string, name: string}[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  
  const MAX_IMAGES = 5;

  // Fetch communities when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCommunities();
    }
  }, [status]);

  const fetchCommunities = async () => {
    setIsLoadingCommunities(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/communities`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      } else {
        console.error('Failed to fetch communities');
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  // Handle dropdown visibility
  const toggleDropdown = () => setShowDropdown((v) => !v);
  const toggleCommunityDropdown = () => setShowCommunityDropdown((v) => !v);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > MAX_IMAGES) {
      document.getElementById('image-limit-modal')?.classList.add('modal-open');
      const allowedFiles = files.slice(0, MAX_IMAGES - images.length);
      
      // Generate previews for allowed files
      const readers = allowedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(newPreviews => {
        setImages(prev => [...prev, ...allowedFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      });
    } else {
      setImages(prev => [...prev, ...files]);
      
      // Generate previews
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(newPreviews => {
        setImagePreviews(prev => [...prev, ...newPreviews]);
      });
    }
  };

  // Remove a selected image
  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Get list of communities
  const getCommunities = async (query: string) => {
    try {
      const response = await fetch(`/api/communities?search=${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  }

  // Handler for form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (status === 'loading') {
      console.log('Authentication status loading...');
      return;
    }

    if (status !== 'authenticated' || !session?.user?.accessToken) { 
      setIsSubmitting(false);
      document.getElementById('auth-error-modal')?.classList.add('modal-open');
      return;
    }

    const formData = new FormData();    
    formData.append('heading', heading);
    formData.append('content', content);
    formData.append('visibility', visibility);
    
    if (selectedCommunity) {
      formData.append('communityId', selectedCommunity);
    }
    
    if (session?.user?.id) {
      formData.append('userId', session.user.id);
    } else {
      setIsSubmitting(false);
      document.getElementById('auth-error-modal')?.classList.add('modal-open');
      return;
    }
    
    images.forEach((img) => {
      formData.append('images', img);
    });
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Post created:', data);
        document.getElementById('success-modal')?.classList.add('modal-open');
        setTimeout(() => {
          router.push('/posts');
        }, 1500);
      } else {
        document.getElementById('error-modal')?.classList.add('modal-open');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      document.getElementById('error-modal')?.classList.add('modal-open');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icon for visibility
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <Eye className="h-5 w-5 text-primary" />;
      case 'Communities': return <Users className="h-5 w-5 text-primary" />;
      case 'private': return <Lock className="h-5 w-5 text-primary" />;
      default: return <Eye className="h-5 w-5 text-primary" />;
    }
  };

  // Show loading state during authentication check or form submission
  if (status === 'loading' || status === 'unauthenticated' || isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center items-center flex flex-col">
            <div className="w-10 h-10 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300">
              {isSubmitting 
                ? "Creating post..." 
                : status === 'loading' 
                  ? "Checking authentication..." 
                  : "Redirecting to login..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the page (only when authenticated)
  return (
    <div className="drawer lg:drawer-open bg-base-200">
      <input id="main-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        
        {/* Auth Status Badge - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-20 left-4 badge badge-lg badge-primary gap-2 z-50">
            <div className={`badge ${status === 'authenticated' ? 'badge-success' : 'badge-error'}`}></div>
            {status}
          </div>
        )}
        
        <main className="flex-1 flex items-center justify-center p-4 py-12 pt-20">
          <div className="card w-full max-w-2xl bg-base-300 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-14 h-14">
                    <PenLine size={28} />
                  </div>
                </div>
                <div>
                  <h1 className="card-title text-3xl font-bold  bg-clip-text text-teal-400">
                    Create New Post
                  </h1>
                  <p className="opacity-70">Share your thoughts with the community</p>
                </div>
              </div>
              
              <div className="divider"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Heading */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-bold">Heading</span>
                  </label>
                  <input
                    type="text"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="Add a heading for your post"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">Be descriptive and concise</span>
                  </label>
                </div>
                
                {/* Content */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-bold">Content</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="textarea textarea-bordered w-full focus:textarea-primary"
                    placeholder="What's on your mind?"
                    required
                  ></textarea>
                  <label className="label">
                    <span className="label-text-alt">Share your thoughts, ideas, or questions</span>
                  </label>
                </div>
                
                {/* Visibility Dropdown */}
                <div className="form-control" ref={dropdownRef}>
                  <label className="label">
                    <span className="label-text text-lg font-bold">Visibility</span>
                  </label>
                  <div className="dropdown w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={toggleDropdown}
                      className="input input-bordered flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon()}
                        <span>{visibility}</span>
                      </div>
                      <ChevronDown size={18} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-full mt-1">
                      <li>
                        <button type="button" onClick={() => setVisibility('public')}>
                          <Eye size={18} />
                          Public
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => setVisibility('Communities')}>
                          <Users size={18} />
                          Communities
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => setVisibility('private')}>
                          <Lock size={18} />
                          Private
                        </button>
                      </li>
                    </ul>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">Who can see this post?</span>
                  </label>
                </div>

                {/* Community Selection (Optional) */}
                <div className="form-control" ref={communityDropdownRef}>
                  <label className="label">
                    <span className="label-text text-lg font-bold">Community (Optional)</span>
                  </label>
                  <div className="dropdown w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={toggleCommunityDropdown}
                      className="input input-bordered flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={18} className="text-primary" />
                        <span>{selectedCommunity ? 
                          communities.find(c => c.id === selectedCommunity)?.name || 'Loading...' : 
                          'Select a community (optional)'}</span>
                      </div>
                      <ChevronDown size={18} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-60 overflow-y-auto">
                      <li>
                        <button type="button" onClick={() => setSelectedCommunity(null)}>
                          None (Post without a community)
                        </button>
                      </li>
                      <div className="divider my-1"></div>
                      {isLoadingCommunities ? (
                        <li className="flex justify-center p-2">
                          <span className="loading loading-spinner loading-sm"></span>
                          <span className="ml-2">Loading communities...</span>
                        </li>
                      ) : communities.length > 0 ? (
                        communities.map(community => (
                          <li key={community.id}>
                            <button type="button" onClick={() => setSelectedCommunity(community.id)}>
                              {community.name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="opacity-70 px-4 py-2 text-center">No communities found</li>
                      )}
                    </ul>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">Share with a specific community</span>
                  </label>
                </div>
                
                {/* Image Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-bold">Images (Optional, max 5)</span>
                    <span className="label-text-alt">{images.length}/{MAX_IMAGES}</span>
                  </label>
                  <div 
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-lg p-8 cursor-pointer hover:bg-base-300/10 transition-colors ${images.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                          <ImageIcon size={24} />
                        </div>
                      </div>
                      <p className="mt-2 font-medium">
                        {images.length >= MAX_IMAGES ? 
                          'Maximum number of images reached' : 
                          'Click to upload image(s)'}
                      </p>
                      <p className="text-xs opacity-70 mt-1">JPG, PNG (max 1MB each)</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={images.length >= MAX_IMAGES}
                    />
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <div className="avatar">
                            <div className="w-24 rounded">
                              <img src={src} alt={`Preview ${idx + 1}`} />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="btn btn-xs btn-circle btn-error absolute -top-2 -right-2 opacity-80 hover:opacity-100"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="divider"></div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !heading || !content}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Post'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="text-center text-xs opacity-70 mt-4">
                <p>All posts are subject to our community guidelines</p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <div className="drawer-side">
        <label htmlFor="main-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar />
      </div>
      
      {/* Modals */}
      {/* Auth Error Modal */}
      <div id="auth-error-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Authentication Error</h3>
          <p className="py-4">You must be logged in to create a post. Please sign in and try again.</p>
          <div className="modal-action">
            <button onClick={() => document.getElementById('auth-error-modal')?.classList.remove('modal-open')} className="btn">Close</button>
            <button onClick={() => router.push('/login')} className="btn btn-primary">Sign In</button>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <div id="success-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-success">Post Created Successfully!</h3>
          <p className="py-4">Your post has been created. Redirecting to posts page...</p>
          <div className="modal-action">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        </div>
      </div>
      
      {/* Error Modal */}
      <div id="error-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Error Creating Post</h3>
          <p className="py-4">There was an error creating your post. Please try again later.</p>
          <div className="modal-action">
            <button onClick={() => document.getElementById('error-modal')?.classList.remove('modal-open')} className="btn">Close</button>
          </div>
        </div>
      </div>

      {/* Image Limit Modal */}
      <div id="image-limit-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Image Limit Reached</h3>
          <p className="py-4">You can upload a maximum of {MAX_IMAGES} images per post. Only the first {MAX_IMAGES} images have been added.</p>
          <div className="modal-action">
            <button onClick={() => document.getElementById('image-limit-modal')?.classList.remove('modal-open')} className="btn">Understood</button>
          </div>
        </div>
      </div>
    </div>
  );
}