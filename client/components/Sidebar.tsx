"use client";

import React from "react";
import { FaHome, FaCompass, FaFire, FaPlus, FaGoogle, FaRegUserCircle, FaRobot } from "react-icons/fa";
import { SiAuth0 } from "react-icons/si";
import { SiAdobephotoshop } from "react-icons/si";
import { GiBookshelf } from "react-icons/gi";
import { BiMenu } from "react-icons/bi";


const hives = [
  { name: "h/chatgpt", icon: <FaHome /> },
  { name: "h/midjourney", icon: <FaRobot /> },
  { name: "h/knowyourmememes", icon: <SiAuth0 /> },
  { name: "h/tolkeinUniverse", icon: <GiBookshelf /> },
  { name: "h/photoshoprequests", icon: <SiAdobephotoshop /> },
  { name: "h/google", icon: <FaGoogle /> },
];

const recentlyVisited = [
  { name: "h/HolyRomanEmpire", icon: <GiBookshelf /> },
  { name: "u/JohnnyBravo47", icon: <FaRegUserCircle /> },
  { name: "h/google", icon: <FaGoogle /> },
  { name: "u/reaperofworlds", icon: <FaRegUserCircle /> },
];

const Sidebar = () => {
  return (
    <>
      {/* Vertical divider line */}
      <div style={{
        position: "fixed",
        top: "70px",
        left: "280px",
        width: "1px",
        height: "calc(100vh - 70px)",
        background: "rgba(255, 255, 255, 0.1)",
        zIndex: 95
      }} />
      
      {/* Toggle button on the divider */}
      <button style={{
        position: "fixed",
        top: "calc(15vh)",
        left: "280px",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "#000",
        border: "1px solid rgba(20, 17, 41, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translateX(-50%) translateY(-50%)",
        cursor: "pointer",
        zIndex: 96,
        padding: 0
      }}>
        <BiMenu color="#fff" size={20} />
      </button>
      
      <aside style={{
        width: 280,
        background: "#1a1f29",
        color: "#fff",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 32,
        position: "fixed",
        top: "70px",
        left: 0,
        height: "calc(100vh - 70px)",
        overflow: "hidden",
        transition: "overflow 0.3s ease",
        zIndex: 90,
        backdropFilter: "blur(5px)"
      }}
      onMouseEnter={(e) => e.currentTarget.style.overflow = "auto"}
      onMouseLeave={(e) => e.currentTarget.style.overflow = "hidden"}
      >
        <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 18 }}><FaHome size={20} /> Home</a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 18 }}><FaCompass size={20} /> Explore</a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 18 }}><FaFire size={20} /> Trending</a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 18 }}><FaPlus size={20} /> New</a>
        </nav>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 20 }}>Your Hives</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {hives.map((hive) => (
              <div key={hive.name} style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 500, fontSize: 16 }}>
                {React.cloneElement(hive.icon, { size: 18 })} {hive.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 20 }}>Recently Visited</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentlyVisited.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 500, fontSize: 16 }}>
                {React.cloneElement(item.icon, { size: 18 })} {item.name}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 