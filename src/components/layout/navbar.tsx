"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  GraduationCap, Plus, Bell, Menu, X, LogOut, User,
  Package, LayoutDashboard, BookOpen, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <GraduationCap className="h-7 w-7" />
          <span className="hidden sm:inline">CampusShare</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/browse" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <Package className="h-4 w-4" /> Browse
          </Link>
          <Link href="/notes" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <BookOpen className="h-4 w-4" /> Study Notes
          </Link>
          {user && (
            <Link href="/chat" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <MessageCircle className="h-4 w-4" /> Chat
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/items/new">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Post Listing
                </Button>
              </Link>
              <button className="relative p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                  <Avatar name={user.name || ""} src={user.avatarUrl || undefined} size="sm" />
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href={`/profile/${user.id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href={`/profile/${user.id}/listings`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="h-4 w-4" /> My Shop
                      </Link>
                      <button onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-2">
          <Link href="/browse" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
            <Package className="h-4 w-4" /> Browse
          </Link>
          <Link href="/notes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
            <BookOpen className="h-4 w-4" /> Study Notes
          </Link>
          {user && (
            <>
              <Link href="/chat" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
                <MessageCircle className="h-4 w-4" /> Chat
              </Link>
              <Link href="/items/new" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
                <Plus className="h-4 w-4" /> Post Listing
              </Link>
              <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
                <User className="h-4 w-4" /> Profile
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              )}
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button size="sm" className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
