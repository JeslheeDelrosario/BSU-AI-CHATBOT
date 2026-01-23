// client/src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import NotificationBell from './NotificationBell';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Settings as SettingsIcon,
  Shield,
  Users,
  BookMarked,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  ChevronLeft
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, mainSidebarCollapsed, setMainSidebarCollapsed } = useSidebar();
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  // Check if we're on AI Tutor page
  const isAITutorPage = location.pathname === '/ai-tutor';

  // Auto-collapse sidebar on AI Tutor page
  useEffect(() => {
    if (isAITutorPage && window.innerWidth >= 1024) {
      setMainSidebarCollapsed(true);
    }
    setSidebarOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAITutorPage]);


  // Global theme state (light/dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored as 'light' | 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const navigation = [
    { name: accessibilitySettings.language === 'fil' ? 'Dashboard' : 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: accessibilitySettings.language === 'fil' ? 'Mag-browse ng Kurso' : 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: accessibilitySettings.language === 'fil' ? 'Aking mga Kurso' : 'My Courses', href: '/my-courses', icon: GraduationCap },
    { name: accessibilitySettings.language === 'fil' ? 'Classroom' : 'Classroom', href: '/classrooms', icon: Users },
    { name: accessibilitySettings.language === 'fil' ? 'AI Tutor' : 'AI Tutor', href: '/ai-tutor', icon: MessageSquare },
    { name: accessibilitySettings.language === 'fil' ? 'Konsultasyon' : 'Consultations', href: '/consultations', icon: Calendar },
    { name: accessibilitySettings.language === 'fil' ? 'Mga Setting' : 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const adminNavigation = [
    { name: t.programs.title, href: '/AdminCOSPrograms', icon: GraduationCap },
    { name: t.faculty.title, href: '/AdminFaculty', icon: Users },
    { name: t.curriculum.title, href: '/AdminCurriculum', icon: BookMarked },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === href;
    return location.pathname.startsWith(href);
  };
  const isAdminRoute = location.pathname.startsWith('/admin') || adminNavigation.some(item => location.pathname.startsWith(item.href));

  // Label gradient classes for active / hover states (darker cyberpunk gradient)
  const activeLabelGradient = 'bg-gradient-to-r from-cyan-700 to-purple-900 bg-clip-text text-transparent font-semibold';
  const hoverLabelGradient = 'group-hover:bg-gradient-to-r group-hover:from-cyan-700 group-hover:to-purple-900 group-hover:bg-clip-text group-hover:text-transparent';

  useEffect(() => {
    setAdminDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row relative overflow-hidden">

        {/* Animated Background Orbs (same as Login/Signup) */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Subtle Grid */}
        <div 
          className="fixed inset-0 dark:opacity-5 opacity-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Sidebar */}
        <aside className={`fixed lg:fixed inset-y-0 left-0 z-50 bg-card/80 backdrop-blur-2xl border-r border-border shadow-2xl transform transition-all duration-500 ease-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : `lg:${mainSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} -translate-x-full`
        } w-80`}>

          <div className="flex flex-col h-full">

            {/* Logo Header */}
            <div className="flex items-center justify-between h-20 px-8 border-b border-border">
              <div className="flex items-center gap-4">
                <img src="/icon-logo.png" alt="TISA" className="w-12 h-12 object-contain drop-shadow-2xl" />
                <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  TISA
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="px-3 py-2 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors flex items-center gap-2 text-sm"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-5 h-5" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      Dark
                    </>
                  )}
                </button>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cyan-400 hover:text-white">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-3">
              {navigation.map((item) => {
                const active = isActive(item.href);
                const labelClass = active ? activeLabelGradient : `text-slate-900 dark:text-gray-400 ${hoverLabelGradient}`;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 shadow-xl shadow-cyan-500/20 border border-cyan-500/30'
                        : 'text-slate-900 dark:text-gray-400 hover:text-cyan-400 dark:hover:text-white hover:bg-white/5 hover:shadow-lg'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-700 dark:text-gray-500 group-hover:text-cyan-400'}`} />
                    <span className={labelClass}>{item.name}</span>
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 -z-10"></div>
                    )}
                  </Link>
                );
              })} 

              {/* ADMIN PANEL */}
              {user?.role === 'ADMIN' && (
                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 group ${
                      isAdminRoute
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-purple-300 shadow-xl shadow-purple-500/20 border border-purple-500/30'
                        : 'text-slate-900 dark:text-gray-400 hover:text-purple-400 dark:hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Shield className={`w-6 h-6 ${isAdminRoute ? 'text-purple-400' : 'text-slate-700 dark:text-gray-500'}`} />
                      <span className={isAdminRoute ? activeLabelGradient : `text-slate-900 dark:text-gray-400 ${hoverLabelGradient}`}>Admin Panel</span>
                    </div>
                    {adminDropdownOpen ? (
                      <ChevronDown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-700 dark:text-gray-500" />
                    )}
                  </button> 

                  {adminDropdownOpen && (
                    <div className="mt-3 ml-10 space-y-2">
                      {adminNavigation.map((item) => {
                        const active = isActive(item.href);
                        const labelClass = active ? activeLabelGradient : `text-slate-700 dark:text-gray-500 ${hoverLabelGradient}`;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                              setSidebarOpen(false);
                              setAdminDropdownOpen(false);
                            }}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl text-base transition-all ${
                              active
                                ? 'bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40'
                                : 'text-slate-700 dark:text-gray-500 hover:text-purple-300 dark:hover:text-purple-300 hover:bg-purple-600/10'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className={labelClass}>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-6 border-t border-border bg-card/60 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-4 flex-1 hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl group-hover:scale-105 transition-transform">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-cyan-400 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 group"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Collapse/Expand Button (Desktop only) */}
        <button
          onClick={() => setMainSidebarCollapsed(!mainSidebarCollapsed)}
          className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-r-xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 items-center gap-2 group ${
            mainSidebarCollapsed ? 'left-0' : 'left-80'
          }`}
          title={mainSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          {mainSidebarCollapsed ? (
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          )}
        </button>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col relative z-10 min-h-screen overflow-y-auto transition-all duration-500 ${
          mainSidebarCollapsed ? 'lg:pl-0' : 'lg:pl-80'
        }`}>
          {/* Mobile Header */}
          <header className="lg:hidden bg-card/60 backdrop-blur-2xl border-b border-border px-6 py-5 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              title={sidebarOpen ? "Close Menu" : "Open Menu"}
            >
              {sidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
            <div className="flex items-center gap-3">
              <img src="/icon-logo.png" alt="TISA" className="w-9 h-9" />
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TISA
              </span>
            </div>
            <NotificationBell />
          </header>

          {/* Desktop Header with Notification Bell */}
          <header className="hidden lg:flex bg-card/60 backdrop-blur-2xl border-b border-border px-10 py-5 items-center justify-end">
            <NotificationBell />
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}