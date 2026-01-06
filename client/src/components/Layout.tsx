// import { ReactNode } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   BookOpen,
//   GraduationCap,
//   MessageSquare,
//   Settings as SettingsIcon,
//   LogOut,
// } from 'lucide-react';

// interface LayoutProps {
//   children: ReactNode;
// }

// const navigation = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//   { name: 'Browse Courses', href: '/courses', icon: BookOpen },
//   { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
//   { name: 'AI Tutor', href: '/ai-tutor', icon: MessageSquare },
//   { name: 'Settings', href: '/settings', icon: SettingsIcon },
// ];

// export default function Layout({ children }: LayoutProps) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="flex items-center h-16 px-6 border-b border-gray-200">
//             <GraduationCap className="w-8 h-8 text-indigo-600" />
//             <span className="ml-2 text-xl font-semibold text-gray-900">AI Learning</span>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-1">
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                     isActive
//                       ? 'bg-indigo-50 text-indigo-600'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5 mr-3" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* User Info */}
//           <div className="p-4 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-900">
//                   {user?.firstName} {user?.lastName}
//                 </p>
//                 <p className="text-xs text-gray-500">{user?.role}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
//                 title="Logout"
//               >
//                 <LogOut className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="pl-64">
//         <main className="p-8">{children}</main>
//       </div>
//     </div>
//   );
// }

// ---------------------------------------------------------------------

// client/src/components/Layout.tsx
// import { ReactNode } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   BookOpen,
//   GraduationCap,
//   MessageSquare,
//   Settings as SettingsIcon,
//   LogOut,
// } from 'lucide-react';

// interface LayoutProps {
//   children: ReactNode;
// }

// const navigation = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//   { name: 'Browse Courses', href: '/courses', icon: BookOpen },
//   { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
//   { name: 'AI Tutor', href: '/ai-tutor', icon: MessageSquare },
//   { name: 'Settings', href: '/settings', icon: SettingsIcon },
// ];

// export default function Layout({ children }: LayoutProps) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     // MODIFIED: Full dark green gradient background
//     <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535]">

//       {/* MODIFIED: Glassmorphism Sidebar */}
//       <div className="fixed inset-y-0 left-0 w-64 bg-green-900/40 backdrop-blur-xl border-r border-green-700/50 shadow-2xl z-50">
//         <div className="flex flex-col h-full">

//           {/* MODIFIED: Logo Area */}
//           <div className="flex items-center h-16 px-6 border-b border-green-700/50">
//             <img src="/icon-logo.png" alt="BSU Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
//             <span className="ml-3 text-xl font-bold text-green-50 tracking-tight">TISA</span>
//           </div>

//           {/* MODIFIED: Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-2">
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
//                     isActive
//                       ? 'bg-green-500/20 text-green-100 border border-green-500/50 shadow-lg shadow-green-500/20'
//                       : 'text-green-300 hover:bg-green-800/40 hover:text-green-100 hover:border-green-600/40 border border-transparent'
//                   }`}
//                 >
//                   <item.icon className={`w-5 h-5 mr-3 transition-colors ${
//                     isActive ? 'text-green-300' : 'text-green-400 group-hover:text-green-200'
//                   }`} />
//                   <span className="relative">
//                     {item.name}
//                     {isActive && (
//                       <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-full"></span>
//                     )}
//                   </span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* MODIFIED: User Info & Logout */}
//           <div className="p-4 border-t border-green-700/50 bg-green-900/50">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-green-100">
//                   {user?.firstName} {user?.lastName}
//                 </p>
//                 <p className="text-xs text-green-400 uppercase tracking-wider">{user?.role}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="p-2.5 text-green-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-300 group"
//                 title="Logout"
//               >
//                 <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODIFIED: Main Content Area */}
//       <div className="pl-64 min-h-screen">
//         <main className="p-8">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }



// client/src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Settings as SettingsIcon,
  Shield,
  Users,
  BookMarked,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
    { name: 'AI Tutor', href: '/ai-tutor', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const adminNavigation = [
    { name: 'CS Programs', href: '/AdminCOSPrograms', icon: GraduationCap },
    { name: 'Faculty Management', href: '/AdminFaculty', icon: Users },
    { name: 'Curriculum', href: '/AdminCurriculum', icon: BookMarked },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => location.pathname === href;
  const isAdminRoute = location.pathname.startsWith('/admin') || adminNavigation.some(item => location.pathname.startsWith(item.href));

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

      <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row relative overflow-hidden">

        {/* Animated Background Orbs (same as Login/Signup) */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Subtle Grid */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-black/60 backdrop-blur-2xl border-r border-white/10 shadow-2xl transform transition-transform duration-500 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">

            {/* Logo Header */}
            <div className="flex items-center justify-between h-20 px-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <img src="/icon-logo.png" alt="TISA" className="w-12 h-12 object-contain drop-shadow-2xl" />
                <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  TISA
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cyan-400 hover:text-white">
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 shadow-xl shadow-cyan-500/20 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-lg'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive(item.href) ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}`} />
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 -z-10"></div>
                  )}
                </Link>
              ))}

              {/* ADMIN PANEL */}
              {user?.role === 'ADMIN' && (
                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
                      isAdminRoute
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-purple-300 shadow-xl shadow-purple-500/20 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Shield className={`w-6 h-6 ${isAdminRoute ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span>Admin Panel</span>
                    </div>
                    {adminDropdownOpen ? (
                      <ChevronDown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {adminDropdownOpen && (
                    <div className="mt-3 ml-10 space-y-2">
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => {
                            setSidebarOpen(false);
                            setAdminDropdownOpen(false);
                          }}
                          className={`flex items-center gap-4 px-5 py-3 rounded-xl text-base transition-all ${
                            isActive(item.href)
                              ? 'bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40'
                              : 'text-gray-500 hover:text-purple-300 hover:bg-purple-600/10'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-cyan-400 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Mobile Header */}
          <header className="lg:hidden bg-black/60 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-cyan-400">
              <Menu className="w-8 h-8" />
            </button>
            <div className="flex items-center gap-3">
              <img src="/icon-logo.png" alt="TISA" className="w-9 h-9" />
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TISA
              </span>
            </div>
            <div className="w-10" />
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