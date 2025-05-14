"use client";

import { useState } from 'react';

interface ProfileDropdownProps {
  profileImage: string;
  userName: string;
  userTag: string;
}

const ProfileDropdown = ({ profileImage, userName, userTag }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="profile-dropdown" style={{ 
      position: "relative", 
      marginLeft: 8 
    }}>
      <button 
        style={{ 
          background: "transparent", 
          border: "none", 
          padding: 0, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          gap: 8
        }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={profileImage} 
          alt="profile" 
          style={{ width: 40, height: 40, borderRadius: "50%" }} 
        />
      </button>
      {isOpen && (
        <div className="profile-menu" style={{ 
          position: "absolute", 
          right: 0, 
          top: "100%", 
          marginTop: 8, 
          background: "#232a3a", 
          borderRadius: 8, 
          padding: 12, 
          minWidth: 180, 
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)", 
          zIndex: 100 
        }}>
          <div style={{ 
            color: "#fff", 
            fontWeight: 600, 
            fontSize: 16, 
            borderBottom: "1px solid rgba(255,255,255,0.1)", 
            paddingBottom: 8, 
            marginBottom: 8 
          }}>
            {userName}
            <div style={{ fontSize: 12, color: "#2de0a7" }}>{userTag}</div>
          </div>
          <div style={{ color: "#aaa", fontSize: 14, cursor: "pointer" }}>Profile</div>
          <div style={{ color: "#aaa", fontSize: 14, marginTop: 5, cursor: "pointer" }}>Settings</div>
          <div style={{ color: "#aaa", fontSize: 14, marginTop: 5, cursor: "pointer" }}>Logout</div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown; 