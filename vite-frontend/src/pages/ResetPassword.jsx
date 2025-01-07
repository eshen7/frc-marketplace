import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AlertBanner from "../components/AlertBanner";

const ResetPassword = () => {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [alertState, setAlertState] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setAlertState({
                open: true,
                message: 'Passwords do not match',
                severity: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post('/password-reset/confirm/', {
                uidb64,
                token,
                new_password: password,
            });
            setAlertState({
                open: true,
                message: 'Password reset successful! Redirecting to login...',
                severity: 'success'
            });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setAlertState({
                open: true,
                message: err.response?.data?.message || 'Failed to reset password',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertBanner
                {...alertState}
                onClose={() => setAlertState({ ...alertState, open: false })}
            />
            <div className="min-h-screen flex flex-col">
                <TopBar />
                <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-center mb-6">Set New Password</h2>

                        {!alertState.open && alertState.severity !== 'success' && (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default ResetPassword;