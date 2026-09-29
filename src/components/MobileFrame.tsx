import React, { useState } from 'react';
import { Wifi, WifiOff, Smartphone, Monitor, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toast } from './Toast';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, activeScreen, toggleOnline, devicePlatform, setDevicePlatform } = useApp();
  const [currentTime] = useState('09:41');

  const isFluid = devicePlatform === 'responsive';

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-800 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans select-none antialiased">
      {/* Top Device Bar (Switcher for Evaluator & Mobile Preview) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[390px] mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-200 font-semibold">STEMMATE Namibia</span>
          <span className="text-[10px] text-teal-400/90 font-mono">v1.1 Mobile</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
          <button
            type="button"
            onClick={() => setDevicePlatform('android')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              devicePlatform === 'android' ? 'bg-teal-700 text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setDevicePlatform('ios')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              devicePlatform === 'ios' ? 'bg-teal-700 text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            iOS
          </button>
          <button
            type="button"
            onClick={() => setDevicePlatform('responsive')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              devicePlatform === 'responsive' ? 'bg-teal-700 text-white font-semibold' : 'hover:text-slate-200'
            }`}
            title="Full fluid touch width"
          >
            <Monitor className="w-3 h-3 inline-block" />
          </button>
        </div>
      </div>

      {/* Mobile Device Chassis */}
      <div
        id="mobile-device-frame"
        className={`w-full ${
          isFluid ? 'max-w-none min-h-screen rounded-none border-0' : 'max-w-[380px] h-[100dvh] max-h-[780px] rounded-[36px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
        } shrink-0 bg-[#F8FAF9] relative flex flex-col overflow-hidden text-[13px]`}
      >
        {/* Mobile Status Bar (iOS dynamic island or Android punch hole) */}
        <div
          aria-hidden="true"
          className="w-full h-8 bg-white flex items-center justify-between px-5 pt-1 text-[11px] font-semibold text-gray-800 shrink-0 select-none z-50 border-b border-gray-100"
        >
          <span className="font-semibold tabular-nums">{currentTime}</span>
          
          {devicePlatform === 'ios' ? (
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 bg-black rounded-full" />
          )}

          <div className="flex items-center gap-1.5 text-gray-700 font-medium">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span className="text-[10px] font-mono">100%</span>
          </div>
        </div>

        {/* Global Offline Network Alert Bar */}
        {!isOnline && activeScreen !== 'login' && (
          <div
            id="system-offline-indicator-banner"
            role="status"
            aria-live="polite"
            className="w-full bg-[#FFFBEB] border-b border-[#FDE68A] px-3.5 py-1.5 flex items-center justify-between text-[#92400E] z-40 shrink-0 select-none"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97706] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]" />
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <CloudOff className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Working offline · Changes saved locally</span>
              </div>
            </div>
            <button
              type="button"
              id="system-offline-reconnect-btn"
              onClick={toggleOnline}
              className="text-[11px] font-bold text-[#B45309] hover:text-[#78350F] underline hover:no-underline active:scale-95 transition-all cursor-pointer"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* App Main Body Viewport */}
        <main id="app-main" className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAF9]">
          {children}
        </main>

        {/* Bottom Gesture / Home Indicator for iOS */}
        {devicePlatform === 'ios' && !isFluid && (
          <div className="w-full h-4 bg-white flex items-center justify-center pointer-events-none z-50">
            <div className="w-28 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Global Toast Layer */}
        <Toast />
      </div>
    </div>
  );
};
