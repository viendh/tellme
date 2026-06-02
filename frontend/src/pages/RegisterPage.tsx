import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function RegisterPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const registerMutation = useRegister();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = t('register.fullNameRequired');
    if (!email) newErrors.email = t('register.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('register.emailInvalid');
    if (!password) newErrors.password = t('login.passwordRequired');
    else if (password.length < 6) newErrors.password = t('register.passwordMin');
    if (!confirmPassword) newErrors.confirmPassword = t('register.confirmPasswordRequired');
    else if (password !== confirmPassword) newErrors.confirmPassword = t('register.passwordsNoMatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    registerMutation.mutate({ email, password, fullName: fullName.trim() });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Tellme</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('register.title')}</h1>
            <p className="text-gray-500 mt-1">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('register.fullName')}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('register.fullNamePlaceholder')}
              error={errors.fullName}
              autoComplete="name"
              required
            />

            <Input
              label={t('register.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label={t('register.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <Input
              label={t('register.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Button type="submit" className="w-full" loading={registerMutation.isPending}>
              {t('register.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
