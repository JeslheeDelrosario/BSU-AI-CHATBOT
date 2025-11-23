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
// client/src/components/Layout.tsx
// client/src/components/Layout.tsx
// client/src/components/Layout.tsx (or wherever your Layout is)
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    setAdminDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-green-900/95 backdrop-blur-2xl border-r border-green-700/60 shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-green-700/50">
              <div className="flex items-center">
                <img src="/icon-logo.png" alt="TISA Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
                <span className="ml-3 text-2xl font-bold text-green-50 tracking-tight">TISA</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-green-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-green-700/70 text-green-100 shadow-lg'
                      : 'text-green-200 hover:bg-green-800/60 hover:text-green-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive(item.href) ? 'text-green-300' : 'text-green-400'}`} />
                  {item.name}
                  {isActive(item.href) && <div className="ml-auto w-1.5 h-8 bg-green-400 rounded-full" />}
                </Link>
              ))}

              {/* ADMIN PANEL DROPDOWN */}
              {user?.role === 'ADMIN' && (
                <div className="relative">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isAdminRoute
                        ? 'bg-green-700/70 text-green-100 shadow-lg'
                        : 'text-green-200 hover:bg-green-800/60 hover:text-green-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <Shield className={`w-5 h-5 mr-3 ${isAdminRoute ? 'text-green-300' : 'text-green-400'}`} />
                      <span>Admin Panel</span>
                    </div>
                    {adminDropdownOpen ? (
                      <ChevronDown className="w-5 h-5 text-green-300" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-200" />
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {adminDropdownOpen && (
                    <div className="mt-2 ml-8 space-y-1 border-l-2 border-green-600 pl-6">
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => {
                            setSidebarOpen(false);
                            setAdminDropdownOpen(false);
                          }}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-green-700/50 text-green-100 font-semibold'
                              : 'text-green-300 hover:bg-green-800/40 hover:text-green-100'
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-3 text-green-400" />
                          {item.name}
                          {isActive(item.href) && (
                            <div className="ml-auto w-1 h-6 bg-green-400 rounded-full" />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* User Info */}
            <div className="p-5 border-t border-green-700/50 bg-green-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-green-950 font-bold shadow-xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-100">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-green-300 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-green-400 hover:text-red-400 hover:bg-red-900/40 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-ancias5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden bg-green-900/90 backdrop-blur-xl border-b border-green-700/50 px-6 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-green-300">
              <Menu className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-3">
              <img src="/icon-logo.png" alt="TISA" className="w-8 h-8" />
              <span className="text-xl font-bold text-green-50">TISA</span>
            </div>
            <div className="w-10" />
          </header>

          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}