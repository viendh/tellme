import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const toggle = () => {
    const next = current === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
      title={current === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <span className="text-base leading-none">{current === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
      <span>{current === 'vi' ? 'VI' : 'EN'}</span>
      <span className="ml-auto text-gray-600">↔</span>
    </button>
  );
}
