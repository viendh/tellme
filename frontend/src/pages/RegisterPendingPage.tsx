import { Link } from 'react-router-dom';
import { LayoutGrid, Clock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RegisterPendingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Tellme</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('registerPending.title')}
          </h1>
          <p className="text-gray-500 mb-6">
            {t('registerPending.message')}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">{t('registerPending.nextStep')}</p>
              <p className="text-sm text-yellow-700 mt-1">
                {t('registerPending.nextStepDesc')}
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white text-center py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {t('registerPending.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
