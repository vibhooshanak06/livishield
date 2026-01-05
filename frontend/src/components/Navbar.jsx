import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Shield, LogOut, Menu, X, User, ChevronDown } from "lucide-react";
import "../styles/theme.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "About", path: "/about" },
    { name: "Car Insurance", path: "/car-insurance" },
    { name: "Health Insurance", path: "/health-insurance" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="livishield-gradient-header shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LiviShield</h1>
                <p className="text-xs text-white/80 leading-none">Insurance Solutions</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "livishield-nav-active"
                    : "text-white/90 hover:livishield-nav-hover"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden lg:block">{user?.firstName || "User"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 livishield-card rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b livishield-border">
                    <p className="text-sm font-medium livishield-text-primary">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs livishield-text-secondary">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm livishield-text-primary hover:livishield-section-light"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-white/90 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink(link.path)
                      ? "bg-white/20 text-white border-l-4 border-white/60"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;