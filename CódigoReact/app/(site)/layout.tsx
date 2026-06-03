'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Outfit } from 'next/font/google';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="pt-br" className={outfit.className}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body suppressHydrationWarning={true}>
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {children}
        <Footer />
      </body>
    </html>
  );
}