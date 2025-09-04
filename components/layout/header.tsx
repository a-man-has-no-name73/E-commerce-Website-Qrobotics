"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, LogOut, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useAuth } from "@/components/auth/auth-context";
import { SearchBar } from "./search-bar";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout error",
        description:
          "There was an issue logging out, but you've been signed out locally",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Qrobotics
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-900"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-600 hover:text-gray-900"
            >
              Categories
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="icon" title="Dashboard">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">Register</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden mt-4 pb-2 border-b">
            <SearchBar />
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-b">
            <div className="flex flex-col space-y-3">
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>

              <div className="border-t pt-3 mt-3">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Button variant="ghost" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
