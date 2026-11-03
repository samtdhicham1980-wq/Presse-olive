import React, { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg border border-[#3F5A2A]/30 bg-[#3F5A2A]/10 px-3 py-1.5 text-xs font-medium text-[#2D421E] transition-colors hover:bg-[#3F5A2A]/20 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        Installer l’application
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Installer sur iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
              <h3 className="text-base font-semibold text-zinc-900">Installer sur iPhone / iPad</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                1. Appuyez sur le bouton <strong>Partager</strong> dans la barre Safari.<br />
                2. Faites défiler et sélectionnez <strong>Sur l’écran d’accueil</strong> pour utiliser l’application hors-ligne à l’huilerie.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white hover:bg-zinc-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Mode Hors-Ligne actif — Vos saisies sont sauvegardées localement sur cet appareil.</span>
    </div>
  );
};
