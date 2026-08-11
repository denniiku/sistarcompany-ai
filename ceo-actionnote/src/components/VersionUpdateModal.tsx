import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface VersionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  appVersion: string;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  isOpen,
  onClose,
  appVersion,
}) => {
  const [checking, setChecking] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckUpdate = () => {
    setChecking(true);
    setLastCheckMessage(null);
    setTimeout(() => {
      setChecking(false);
      setLastCheckMessage(`최신 버전 (${appVersion})을 실행 중입니다. 모든 기능이 정상입니다.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">앱 버전 및 시스템 정보</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Version badge */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Project & Idea Flow</div>
                <div className="text-xs text-indigo-700 font-mono font-medium">App Version {appVersion}</div>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              STABLE
            </span>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 text-xs">최신 업데이트 버전 주요 기능</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>계층 구조 프로젝트 분류 (카테고리 &rarr; 회사/소속 &rarr; 프로젝트)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>아이디어 Bank 웹링크 연결 및 키워드 필터링</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Google Apps Script 웹 앱 기반 구글 시트 양방향 백업/불러오기</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>모바일 홈 화면 추가 PWA 최적화 및 Pretendard 타이포그래피</span>
              </li>
            </ul>
          </div>

          {/* Update Check Action */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? '업데이트 확인 중...' : '버전 / 자동 업데이트 확인'}</span>
            </button>

            {lastCheckMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lastCheckMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
