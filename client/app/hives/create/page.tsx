'use client';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, Eye, Lock, ImageIcon, ListPlus, Loader2 } from 'lucide-react';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { toast } from 'react-hot-toast';

export default function CreateHivePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' }
  ]);
  const profilePicRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Add a new rule field
  const addRule = () => {
    setRules([...rules, { title: '', description: '' }]);
  };

  // Remove a rule field
  const removeRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
  };

  // Update a rule field
  const updateRule = (index: number, field: 'title' | 'description', value: string) => {
    const updatedRules = [...rules];
    updatedRules[index][field] = value;
    setRules(updatedRules);
  };

  // Validate name input
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name cannot be empty');
      return false;
    } else if (value.includes(' ')) {
      setNameError('Name cannot contain spaces');
      return false;
    } else if (value.length < 3) {
      setNameError('Name must be at least 3 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  // Handle profile picture selection
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner image selection
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Reset and check validation
    if (!validateName(name)) {
      return;
    }

    if (status === 'loading') {
      toast.error('Still checking authentication status. Please wait.');
      return;
    }

    // Check for authentication and access token
    if (status !== 'authenticated' || !session?.user?.accessToken) {
      setErrorMessage('You must be logged in to create a hive, or your session is missing an access token');
      toast.error('Authentication error. Please log in again.');
      return;
    }

    // Validate form
    if (!description.trim()) {
      setErrorMessage('Please fill in the description field');
      return;
    }

    // Filter out empty rules
    const filteredRules = rules.filter(rule => rule.title.trim() && rule.description.trim());

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('isPrivate', String(isPrivate));
    formData.append('rules', JSON.stringify(filteredRules));
    
    if (session?.user?.id) {
      formData.append('userId', session.user.id);
    } else {
      setErrorMessage('Your session is missing a user ID. Cannot create hive.');
      setIsSubmitting(false);
      return;
    } 

    if (profilePic) {
      formData.append('profilePicture', profilePic);
    }

    if (bannerImage) {
      formData.append('bannerImage', bannerImage);
    }

    // Get API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${apiUrl}/api/communities`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Hive created successfully!');
        router.push('/hives');
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || response.statusText || 'Unknown error';
        setErrorMessage(`Failed to create hive: ${errorMsg}`);
        toast.error(`Hive creation failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while creating the hive. Please try again.');
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-300 to-base-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl p-8 flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Loading your session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-300 to-base-100">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px] py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-primary bg-opacity-20 p-3 rounded-lg shadow-sm">
                <Users size={24} color='white' />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-base-content">Create New Hive</h1>
                <p className="text-base-content/70 mt-1">Build a community around your interests</p>
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 card bg-base-200 shadow-xl p-6 rounded-2xl">
              {/* Hive Name */}
              <div className="form-control">
                <label className="block text-lg mb-2 text-base-content font-bold">
                  Hive Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className={`input input-bordered w-full bg-base-100 text-base-content focus:border-primary transition ${nameError ? 'input-error' : ''}`}
                  placeholder="Name your community (3-50 characters, no spaces)"
                  minLength={3}
                  maxLength={50}
                  required
                />
                {nameError ? (
                  <p className="text-error text-sm mt-1">{nameError}</p>
                ) : (
                  <p className="text-base-content/60 text-sm mt-1">Choose a unique, memorable name for your hive (no spaces allowed)</p>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="block text-lg mb-2 text-base-content font-bold">
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:border-primary transition"
                  placeholder="Describe what your hive is about (max 500 characters)"
                  maxLength={500}
                  required
                ></textarea>
                <p className="text-base-content/60 text-sm mt-1">Tell potential members what your hive is all about</p>
              </div>

              {/* Privacy Setting */}
              <div className="form-control">
                <label className="block text-lg mb-2 text-base-content font-bold">Privacy</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <label htmlFor="isPrivate" className="text-base-content cursor-pointer flex items-center gap-2">
                    {isPrivate ? (
                      <>
                        <Lock className="w-5 h-5 text-primary" />
                        <span>Private Hive</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 text-primary" />
                        <span>Public Hive</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-base-content/60 text-sm mt-1">
                  {isPrivate 
                    ? "Private hives require approval to join and are not visible in search results" 
                    : "Public hives are open to everyone and appear in search results"}
                </p>
              </div>

              {/* Profile Picture */}
              <div className="form-control">
                <label className="block text-lg mb-2 text-base-content font-bold">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  {profilePicPreview ? (
                    <div className="relative">
                      <img 
                        src={profilePicPreview} 
                        alt="Profile Preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => { setProfilePic(null); setProfilePicPreview(''); }}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => profilePicRef.current?.click()}
                      className="w-24 h-24 rounded-full bg-base-100 flex items-center justify-center cursor-pointer hover:bg-base-300 transition-colors border-2 border-dashed border-primary/30"
                    >
                      <ImageIcon size={32} className="text-primary/70" />
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => profilePicRef.current?.click()}
                      className="btn btn-outline btn-primary"
                    >
                      {profilePicPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
                    </button>
                    <p className="text-base-content/60 text-sm mt-1">Square image recommended (JPG, PNG)</p>
                  </div>
                  <input
                    type="file"
                    ref={profilePicRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="form-control">
                <label className="block text-lg mb-2 text-base-content font-bold">Banner Image</label>
                {bannerImagePreview ? (
                  <div className="relative">
                    <img 
                      src={bannerImagePreview} 
                      alt="Banner Preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => { setBannerImage(null); setBannerImagePreview(''); }}
                      className="absolute top-2 right-2 bg-error text-white rounded-full p-1 hover:bg-error/80 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => bannerImageRef.current?.click()}
                    className="w-full h-48 rounded-lg bg-base-100 flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors border-2 border-dashed border-primary/30"
                  >
                    <ImageIcon size={48} className="text-primary/70 mb-2" />
                    <p className="text-base-content/80">Click to upload banner image</p>
                  </div>
                )}
                <p className="text-base-content/60 text-sm mt-1">Recommended size: 1920x300 (Wide banner image for your hive)</p>
                <input
                  type="file"
                  ref={bannerImageRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerImageChange}
                />
              </div>

              {/* Community Rules */}
              <div className="form-control">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg text-base-content font-bold">Community Rules</label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    <ListPlus size={16} className="mr-1" /> Add Rule
                  </button>
                </div>
                
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={index} className="bg-base-100 p-4 rounded-lg border border-base-300">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base-content font-medium">Rule #{index + 1}</h3>
                        {rules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRule(index)}
                            className="text-error hover:text-error/80 btn btn-sm btn-ghost"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-base-content/70 text-sm">Title</label>
                          <input
                            type="text"
                            value={rule.title}
                            onChange={(e) => updateRule(index, 'title', e.target.value)}
                            placeholder="Rule title"
                            className="input input-bordered w-full bg-base-200 text-base-content mt-1 focus:border-primary"
                          />
                        </div>
                        
                        <div>
                          <label className="text-base-content/70 text-sm">Description</label>
                          <textarea
                            value={rule.description}
                            onChange={(e) => updateRule(index, 'description', e.target.value)}
                            placeholder="Explain the rule"
                            className="textarea textarea-bordered w-full bg-base-200 text-base-content mt-1 focus:border-primary"
                            rows={2}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-base-content/60 text-sm mt-2">Set clear rules to maintain a healthy community</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary px-8"
                  disabled={isSubmitting || !!nameError}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Hive'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}