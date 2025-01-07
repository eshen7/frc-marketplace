import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import SuccessBanner from '../components/SuccessBanner';
import ErrorBanner from '../components/ErrorBanner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (success) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCanResend(false);

    try {
      await axiosInstance.post('/password-reset/', { email });
      setSuccess(true);
      setCountdown(60); // Start 60 second countdown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setCanResend(false);

    try {
      await axiosInstance.post('/password-reset/', { email });
      setCountdown(60); // Reset countdown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend reset email');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
          
          {success ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">
                If an account exists with this email, you will receive password reset instructions.
              </p>
              {countdown > 0 ? (
                <p className="text-gray-600 mb-4">
                  You can resend the email in {countdown} seconds
                </p>
              ) : canResend ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Haven't received the email?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400"
                  >
                    {loading ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              ) : null}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 hover:underline mt-4 block w-full"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {error && <ErrorBanner message={error} onClose={() => setError('')} />}
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword; 