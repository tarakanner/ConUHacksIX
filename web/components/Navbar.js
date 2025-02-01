"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from 'next/image';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout");
    window.location.href = "/login"; // Redirect to login after logout
  };

  return (
    <nav className="bg-logo_bg p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo.png"
            width={100}
            height={100}
            alt="Picture of the author"
            className="cursor-pointer"
          />
        </Link>

        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/admin" className="text-white hover:text-gray-400">
                Admin
              </Link>
              <span className="text-gray-300">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-gray-400">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
