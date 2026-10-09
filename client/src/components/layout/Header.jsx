import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, ShoppingBag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Farm', path: '/our-farm' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-header shadow-md py-3.5 border-b border-farm-sand/20 dark:border-white/5'
            : 'bg-farm-cream/95 dark:bg-[#0e1410]/95 py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo / Wordmark */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-farm-forest dark:bg-farm-grass flex items-center justify-center text-farm-sand shadow-md group-hover:scale-105 transition-transform">
                <span className="font-display font-bold text-lg text-white">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-farm-forest dark:text-white leading-none">
                  BestGrassFed<span className="text-farm-grass dark:text-farm-sand">Cattle</span>
                </span>
                <span className="text-[10px] tracking-widest text-farm-earth dark:text-farm-sandLight uppercase font-medium mt-0.5">
                  Kansas • 100% Pasture Raised
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-farm-grass dark:text-farm-sand font-semibold'
                        : 'text-farm-charcoal/80 dark:text-gray-300 hover:text-farm-forest dark:hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-farm-grass dark:bg-farm-sand rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Search Trigger */}
              <Link
                to="/products"
                className="p-2 text-farm-charcoal/70 dark:text-gray-300 hover:text-farm-forest dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Dark / Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 text-farm-charcoal/70 dark:text-gray-300 hover:text-farm-forest dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle color theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-farm-forest" />}
              </button>

              {/* Primary "ORDER BEEF" CTA Button */}
              <Link
                to="/products"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-farm-forest hover:bg-farm-grass text-white text-xs sm:text-sm font-semibold rounded-xl tracking-wide uppercase transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-farm-sand" />
                <span>Order Beef</span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-farm-charcoal dark:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-[#121813] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-farm-sand/30 dark:border-white/10 animate-slideIn">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-farm-forest dark:bg-farm-grass flex items-center justify-center text-farm-sand font-display font-bold">
                    B
                  </div>
                  <span className="font-display font-bold text-farm-forest dark:text-white">
                    BestGrassFedCattle
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="py-6 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'text-farm-grass dark:text-farm-sand font-semibold border-l-2 border-farm-grass dark:border-farm-sand pl-3.5 bg-transparent'
                          : 'text-farm-charcoal dark:text-gray-300 hover:text-farm-forest dark:hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom CTA */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-3">
              <Link
                to="/products"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-farm-forest hover:bg-farm-grass text-white font-medium rounded-xl text-sm uppercase tracking-wider shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-farm-sand" />
                Order Beef Now
              </Link>
              <div className="text-center text-xs text-gray-400">
                Direct Farm Requests • Kansas Pastures
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
