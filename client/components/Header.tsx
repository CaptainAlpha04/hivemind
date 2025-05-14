"use client";

import React from "react";
import { BsChatDots, BsBell, BsStars, BsPlusCircle, BsSearch } from "react-icons/bs";
import ProfileDropdown from "./ProfileDropdown";
import Image from "next/image";

const Header = () => {
  return (
    <header style={{
      position: "fixed",
      top: 0,
      right: 0,
      left: 0,
      zIndex: 100,
      background: "#181e29",
      padding: "15px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      height: "70px"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 12 
      }}>
        <Image src="/images/logo.png" alt="HiveMind" width={40} height={40} />
        <div style={{ fontSize: 28 }}>
          <span style={{ color: "#fff", fontWeight: 300 }}>Hive</span>
          <span style={{ color: "#2de0a7", fontWeight: 700 }}>Mind</span>
        </div>
      </div>

      <div style={{ 
        display: "flex",
        alignItems: "center",
        gap: 20,
        width: "700px" 
      }}>
        <button style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "#000", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer" 
        }}>
          <BsSearch color="#fff" size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Search Hives, Stories and more..." 
          style={{ 
            background: "#232a3a", 
            border: "none", 
            borderRadius: 24, 
            padding: "10px 15px", 
            color: "#fff", 
            width: "90%", 
            fontSize: 16 
          }} 
        />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "#000", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer" 
        }}>
          <BsChatDots color="#fff" size={20} />
        </button>
        <button style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "#000", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer" 
        }}>
          <BsBell color="#fff" size={20} />
        </button>
        <button style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "#000", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer" 
        }}>
          <BsStars color="#fff" size={20} />
        </button>
        <button style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "#000", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer" 
        }}>
          <BsPlusCircle color="#fff" size={20} />
        </button>
        <ProfileDropdown 
          profileImage="https://picsum.photos/40/40?random=5"
          userName="Muhammad Faseeh"
          userTag="#Zen"
        />
      </div>
    </header>
  );
};

export default Header;
