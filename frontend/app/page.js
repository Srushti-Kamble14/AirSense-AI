// Home page for AirSenseAi's public entry point and project overview.
// This placeholder will later introduce core air quality intelligence features.
"use client";

import React, { useState, useEffect } from 'react';


export default function DashboardPage() {

  const [liveData, setLiveData] = useState({
    aqi: "Loading...",
    weather: "Loading...",
    status: "Fetching global feed..."
  });

  useEffect(() => {

    const timer = setTimeout(() => {
      setLiveData({
        aqi: "42 (Good)",
        weather: "28°C, Partly Cloudy",
        status: "System Active"
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: "10px" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
          AirSense-AI Dashboard
        </h1>
        <p style={{ color: "#6b7280", marginTop: "5px" }}>
          Real-time Air Quality & Weather Analytics
        </p>
      </div>

      {/* Grid Layout for Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        
        {/* Air Quality Index Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
            <h3 style={cardTitleStyle}>Air Quality Index</h3>
            <span style={{ backgroundColor: "#e6f4ea", color: "#137333", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Live</span>
          </div>
          <p style={cardValueStyle}>{liveData.aqi}</p>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "10px 0 0 0" }}>PM2.5, PM10, and NO₂ levels are stable.</p>
        </div>

        {/* Weather Status Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
            <h3 style={cardTitleStyle}>Weather Status</h3>
            <span style={{ backgroundColor: "#e8f0fe", color: "#1a73e8", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Live</span>
          </div>
          <p style={cardValueStyle}>{liveData.weather}</p>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "10px 0 0 0" }}>Humidity: 65% | Wind: 12 km/h</p>
        </div>

        {/* Quick System Alert Card */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h3 style={cardTitleStyle}>System Health & Recommendations</h3>
          <div style={{ padding: "12px", backgroundColor: "#fef3c7", borderRadius: "6px", color: "#92400e", marginTop: "10px", fontSize: "14px" }}>
            <strong>Status:</strong> {liveData.status} — Safe to go out for a jog. Air quality is within standard limits.
          </div>
        </div>

      </div>
    </div>
  );
}


const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
};

const cardTitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#4b5563",
  margin: 0,
  flex: 1
};

const cardValueStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#111827",
  margin: "15px 0 0 0"
};