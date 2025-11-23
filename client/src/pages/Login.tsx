// client/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

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
      setError(err.response?.data?.error || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-800/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/icon-logo.png" alt="TISA Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-bold text-green-50 mb-3">TISA</h1>
          <p className="text-green-300 text-lg">Towards Intelligence Student Assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-green-900/40 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-green-100 text-center mb-8">
            Welcome Back
          </h2>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/60 border border-red-600/70 rounded-xl flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-green-200 font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                  placeholder="you@bulsu.edu.ph"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-green-200 font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold text-xl rounded-xl shadow-2xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-green-300 text-lg">
              Don't have an account?{' '}
              <Link
                to="/Signup"
                className="text-green-100 font-bold hover:text-white underline decoration-2 underline-offset-4 transition-all"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-green-400 text-sm mt-8 opacity-80">
          © 2025 Bulacan State University • TISA
        </p>
      </div>
    </div>
  );
}