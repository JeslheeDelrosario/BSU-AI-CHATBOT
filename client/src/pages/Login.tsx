// client/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-md w-full px-8">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/icon-logo.png" 
                alt="TISA Logo" 
                className="w-24 h-24 object-contain filter drop-shadow-2xl"
              />
              <Zap className="absolute -top-2 -right-2 w-8 h-8 text-cyan-400 animate-ping" />
            </div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            TISA
          </h1>
          <p className="text-gray-400 mt-3 text-lg font-light tracking-wider">
            Towards Intelligence Student Assistant
          </p>
        </div>

        {/* Login Card - Glassmorphism + Border Glow */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
          {/* Inner glow border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-600/20 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              WELCOME
            </h2>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 transition pointer-events-none z-20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="
                    w-full pl-12 pr-5 py-4 
                    bg-white/10 border border-white/20 rounded-xl 
                    text-white placeholder-gray-500 
                    focus:outline-none focus:border-cyan-400 focus:bg-white/15 
                    backdrop-blur-sm transition-all duration-300
                    [-webkit-text-fill-color:white]            /* forces white text */
                    [-webkit-background-clip:text]              /* needed for some browsers */
                    shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)] /* dark overlay */
                    [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:[-webkit-text-fill-color:white]
                    [&::-webkit-autofill]:bg-transparent
                  "
                  placeholder="you@bulsu.edu.ph"
                  required
                />
              </div>

              {/* Password Field – autofill-proof */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 transition pointer-events-none z-20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="
                    w-full pl-12 pr-5 py-4 
                    bg-white/10 border border-white/20 rounded-xl 
                    text-white placeholder-gray-500 
                    focus:outline-none focus:border-cyan-400 focus:bg-white/15 
                    backdrop-blur-sm transition-all duration-300
                    [-webkit-text-fill-color:white]
                    shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:[-webkit-text-fill-color:white]
                    [&::-webkit-autofill]:bg-transparent
                  "
                  placeholder="Enter secure password"
                  required
                />
              </div>

              {/* Submit Button - Electric glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl relative overflow-hidden group shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-60"
              >
                <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign in'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-400">
                New student?{' '}
                <Link 
                  to="/signup" 
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition"
                >
                  Register for access →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-12 tracking-wider">
          © 2025 Bulacan State University • TISA Labs • AI-Powered Learning
        </p>
      </div>
    </div>
  );
}