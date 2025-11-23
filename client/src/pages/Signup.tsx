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
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-800/20"></div>
        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <img src="/icon-logo.png" alt="TISA Logo" className="w-24 h-24 mx-auto drop-shadow-2xl" />
            <h1 className="text-5xl font-bold text-green-50 mt-6">TISA</h1>
          </div>

          <div className="bg-green-900/40 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl p-12 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-4xl font-bold text-green-100 mb-4">Welcome to TISA!</h2>
            <p className="text-2xl text-green-200 mb-3">
              Account created successfully
            </p>
            <p className="text-green-300 text-lg">
              Hello, <span className="font-bold text-green-100">{formData.firstName} {formData.lastName}</span>!
            </p>
            <p className="text-green-400 mt-8 text-sm">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SIGNUP FORM
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-800/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <img src="/icon-logo.png" alt="TISA Logo" className="w-24 h-24 mx-auto drop-shadow-2xl" />
          <h1 className="text-5xl font-bold text-green-50 mt-6 mb-3">TISA</h1>
          <p className="text-green-300 text-lg">Towards Intelligence Student Assistant</p>
        </div>

        {/* Form Card */}
        <div className="bg-green-900/40 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-green-100 text-center mb-8">
            Create Your Account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/60 border border-red-600/70 rounded-xl flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-green-200 font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-green-200 font-medium mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-green-200 font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                  placeholder="you@bulsu.edu.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-green-200 font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-green-200 font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-5 py-4 bg-green-800/50 border border-green-600 rounded-xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold text-xl rounded-xl shadow-2xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Create Account
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-green-300 text-lg">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-green-100 font-bold hover:text-white underline decoration-2 underline-offset-4 transition-all"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-green-400 text-sm mt-8 opacity-80">
          © 2025 Bulacan State University • TISA
        </p>
      </div>
    </div>
  );
}