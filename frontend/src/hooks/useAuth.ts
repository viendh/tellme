import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { authApi, type LoginInput, type RegisterInput } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface ApiError {
  message?: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/projects');
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg = error.response?.data?.message ?? '';
      if (msg.includes('ACCOUNT_PENDING_APPROVAL')) {
        toast.error('Your account is pending admin approval.', { duration: 5000 });
      } else if (msg.includes('deactivated')) {
        toast.error('Your account has been deactivated. Contact admin.');
      } else {
        toast.error('Invalid email or password');
      }
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      if (data.user.isApproved) {
        // First user (admin) — login immediately
        login(data.token, data.user);
        toast.success('Welcome! Your admin account is ready.');
        navigate('/projects');
      } else {
        // Regular user — redirect to pending page
        navigate('/register/pending');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg = error.response?.data?.message ?? '';
      if (msg.includes('already in use')) {
        toast.error('This email is already registered.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };
}
