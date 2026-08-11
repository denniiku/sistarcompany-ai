import React from 'react';
import { Layers, Cloud, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  hasSheetUrl: boolean;
  onOpenAppsScriptGuide: () => void;
  onCheckUpdate: () => void;
  onSyncSheet: () => void;
  isSyncing?: boolean;
  appVersion: string;
}

export const Header: React.FC<HeaderProps> = ({
  hasSheetUrl,
  onOpenAppsScriptGuide,
  onCheckUpdate,
  onSyncSheet,
  isSyncing,
  appVersion,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white">
                SC Projects
              </h1>
              <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                대시보드
              </span>
              <span 
                onClick={onCheckUpdate}
                title="버전 확인"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:text-white transition-colors"
              >
                {appVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">통합 프로젝트 & 아이디어 관제 대시보드</p>
          </div>
        </div>

        {/* Action Buttons: Google Sheets 1-Click Sync */}
        <div className="flex items-center space-x-2">
          {hasSheetUrl ? (
            <button
              onClick={onSyncSheet}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="클릭 시 구글 드라이브 시트에 자동으로 데이터가 백업됩니다"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? '백업 중...' : '구글시트 1터치 자동 백업'}</span>
              <span className="sm:hidden">{isSyncing ? '백업 중' : '시트 백업'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAppsScriptGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-700/60 text-xs font-semibold transition-all"
              title="구글 드라이브 시트 연동 설정하기"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">구글시트 연동</span>
            </button>
          )}

          <button
            onClick={onCheckUpdate}
            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors"
            title="업데이트 확인"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

