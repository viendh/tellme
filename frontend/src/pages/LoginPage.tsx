import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const loginMutation = useLogin();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = t('login.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('login.emailInvalid');
    if (!password) newErrors.password = t('login.passwordRequired');
    else if (password.length < 6) newErrors.password = t('login.passwordMin');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Tellme</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
            <p className="text-gray-500 mt-1">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              {t('login.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
            {t('login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
