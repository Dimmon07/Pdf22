import React, { useState } from 'react';
import { DownloadCloud, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'badge';
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary',
  label = 'Встановити на Android (.apk / PWA)'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed in standalone mode
  if (isInstalled || justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Встановлено на пристрій</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) setJustInstalled(true);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In browser preview, trigger native or guide
      alert('Щоб встановити застосунок на Android:\n1. Відкрийте це посилання в Google Chrome на телефоні.\n2. Натисніть меню (⋮) -> "Встановити додаток" або "Додати на головний екран".\nAndroid автоматично створить та встановить нативний WebAPK!');
    }
  };

  const getStyle = () => {
    if (variant === 'badge') {
      return 'px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition flex items-center gap-1';
    }
    if (variant === 'secondary') {
      return 'px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold shadow-xs active:scale-95 transition flex items-center gap-1.5';
    }
    return 'px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 active:scale-95 transition flex items-center gap-1.5 animate-pulse hover:animate-none';
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Встановити як автономний мобільний застосунок (WebAPK)"
        className={`${getStyle()} ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                Встановлення на iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
              1. Натисніть кнопку <strong>«Поділитися» (Share / ⎙)</strong> у нижній панелі Safari.<br />
              2. Прокрутіть список та виберіть <strong>«На початковий екран» (Add to Home Screen)</strong>.<br />
              3. Застосунок додасться як повноцінна іконка на робочий стіл із підтримкою офлайн-роботи.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2 text-xs font-semibold shadow-sm transition"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}
    </>
  );
};
