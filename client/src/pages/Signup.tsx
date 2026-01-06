// client/src/pages/Signup.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.includes('@') || !email.includes('.')) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN — Futuristic Style
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-md w-full px-8 text-center">
          <img src="/icon-logo.png" alt="TISA" className="w-28 h-28 mx-auto drop-shadow-2xl mb-8" />
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            TISA
          </h1>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
            <div className="w-28 h-28 bg-cyan-500/20 rounded-full mx-auto mb-8 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-20 h-20 text-cyan-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome Aboard!</h2>
            <p className="text-2xl text-gray-300 mb-2">Account created successfully</p>
            <p className="text-xl text-cyan-300 font-medium">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="text-gray-400 mt-8 text-sm">Redirecting to login in 3...</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SIGNUP FORM — Cyber Tech Style
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-md w-full px-8">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <img src="/icon-logo.png" alt="TISA" className="w-24 h-24 mx-auto drop-shadow-2xl" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mt-6">
            TISA
          </h1>
          <p className="text-gray-400 mt-2 text-lg font-light tracking-wider">
            Towards Intelligence Student Assistant
          </p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-600/10 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Join the Future
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 z-20 pointer-events-none" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 backdrop-blur-sm transition-all duration-300
                      [-webkit-text-fill-color:white] shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                      [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                      [&::-webkit-autofill]:[-webkit-text-fill-color:white]"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 z-20 pointer-events-none" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 backdrop-blur-sm transition-all duration-300
                      [-webkit-text-fill-color:white] shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                      [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                      [&::-webkit-autofill]:[-webkit-text-fill-color:white]"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 z-20 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 backdrop-blur-sm transition-all duration-300
                    [-webkit-text-fill-color:white] shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:[-webkit-text-fill-color:white]"
                    placeholder="you@bulsu.edu.ph"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 z-20 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 backdrop-blur-sm transition-all duration-300
                    [-webkit-text-fill-color:white] shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:[-webkit-text-fill-color:white]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 z-20 pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 backdrop-blur-sm transition-all duration-300
                    [-webkit-text-fill-color:white] shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(30,41,59,0.8)]
                    [&::-webkit-autofill]:[-webkit-text-fill-color:white]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl relative overflow-hidden group shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? 'Creating Account...' : (
                    <>
                      Create Account <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-12 tracking-wider">
          © 2025 Bulacan State University • TISA Labs
        </p>
      </div>
    </div>
  );
}