// Root application layout for shared navigation, metadata, and global structure.
// This file will wrap all App Router pages once frontend implementation begins.

import Navbar from "../components/Navbar/Navbar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";


export const metadata = {
  title: "AirSense-AI",
  description: "AI-Powered Air Quality & Weather Monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Navbar />

          <main style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}