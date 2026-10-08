import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Package,
  FileText,
  Quote,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await api.getUnreadNotifications();
        if (res.success) {
          setUnreadCount(res.unreadCount || 0);
          setNotifications(res.notifications || []);
        }
      } catch (err) {
        // silent fail in polling
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/admin/products', icon: Package },
    { name: 'CMS & Site Content', path: '/admin/cms', icon: FileText },
    { name: 'Testimonials', path: '/admin/testimonials', icon: Quote },
    { name: 'Notification Channels', path: '/admin/notifications', icon: Bell },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c120e] text-farm-charcoal dark:text-gray-100 flex flex-col lg:flex-row antialiased">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#121813] border-b border-gray-200 dark:border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-display font-bold text-farm-forest dark:text-white">Admin Hub</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-farm-forest text-farm-sand flex items-center justify-center font-bold text-xs">
            {admin?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#121813] border-r border-gray-200 dark:border-white/10 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-farm-forest text-farm-sand flex items-center justify-center font-display font-bold text-base shadow">
                B
              </div>
              <div>
                <span className="font-display font-bold text-base text-farm-forest dark:text-white block leading-none">
                  BestGrassFed
                </span>
                <span className="text-[10px] uppercase font-semibold text-farm-grass tracking-widest">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-farm-forest text-white shadow-sm font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-farm-forest dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer with Logout & Frontend Link */}
        <div className="p-3 border-t border-gray-100 dark:border-white/10 space-y-1">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-farm-forest dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            <span>View Frontend Site</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-[#121813] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20">
          <div>
            <span className="text-xs font-medium text-gray-400">Farm Admin Operations</span>
            <h2 className="text-lg font-display font-bold text-farm-forest dark:text-white">
              {navItems.find(n => n.path === location.pathname)?.name || 'Admin Console'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-500 hover:text-farm-forest dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative"
                aria-label="Admin notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#151c17] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                    <span className="font-display font-semibold text-xs text-farm-forest dark:text-white">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-farm-grass hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto py-2 space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-farm-cream dark:bg-white/5 text-xs">
                          <div className="font-semibold text-farm-forest dark:text-white">{n.title}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-farm-forest dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-farm-forest text-farm-sand flex items-center justify-center font-bold text-xs">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-xs">
                <span className="font-bold text-farm-forest dark:text-white block">{admin?.username || 'Admin'}</span>
                <span className="text-[10px] text-gray-400 block">{admin?.role || 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}
