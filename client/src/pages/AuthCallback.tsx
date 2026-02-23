import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type CallbackStatus = 'processing' | 'success' | 'error';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' 
          ? 'You cancelled the sign-in process.' 
          : `Authentication error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received.');
        return;
      }

      try {
        const response = await api.get('/auth/google/callback', {
          params: { code, state }
        });

        const { token, user } = response.data;

        loginWithToken(token, user);

        setStatus('success');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Authentication failed. Please try again.'
        );
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full px-8">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Signing you in...</h2>
              <p className="text-gray-400">Please wait while we complete your authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-gray-400">Authentication successful. Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
