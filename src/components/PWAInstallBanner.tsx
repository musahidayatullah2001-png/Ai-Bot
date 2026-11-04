import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Laptop, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../lib/sound';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'button';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed or dismissed, don't show
  if (isInstalled || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleInstallClick = async () => {
    sound.playPop();
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isInstallable) {
      await install();
    }
  };

  // Compact Header / Nav Button Variant
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 ${className}`}
          title="Pasang Aura di Layar Utama (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Aura</span>
        </button>

        {/* iOS Install Instruction Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-purple-200 dark:border-purple-800 text-zinc-800 dark:text-zinc-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-sm">Pasang Aura di iPhone/iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tekan tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-purple-500" /> di menu browser Safari bawah.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Gulir ke bawah lalu pilih opsi <strong>Tambah ke Layar Utama (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-purple-500" />.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Aura siap digunakan layaknya aplikasi native!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Floating Banner Variant (Bottom / Header notification)
  if (isDismissed) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`relative p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-pink-900/90 backdrop-blur-xl border border-purple-400/40 text-white shadow-xl flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-300/40 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Pasang Aplikasi Aura</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-400/30 font-medium">
                  PWA Cepat
                </span>
              </div>
              <p className="text-[11px] text-purple-200 line-clamp-1">
                Install di layar HP atau laptop untuk akses instan & mode offline!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Install Sekarang
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-purple-300 hover:text-white"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-purple-200 dark:border-purple-800 text-zinc-800 dark:text-zinc-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm">Pasang Aura di iPhone/iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Tekan tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-purple-500" /> di Safari.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Pilih opsi <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              Mengerti
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
