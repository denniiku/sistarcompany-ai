import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Code2, Sparkles, BookOpen } from 'lucide-react';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appsScriptCode = `/**
 * Project & Idea Flow - Google Apps Script (GAS) Web App DB
 * 구글 시트를 데이터베이스로 활용하기 위한 스크립트 코드입니다.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 프로젝트 시트 읽기
  var projSheet = sheet.getSheetByName("Projects") || sheet.insertSheet("Projects");
  var projData = projSheet.getDataRange().getValues();
  var projects = [];
  if (projData.length > 1) {
    for (var i = 1; i < projData.length; i++) {
      if (projData[i][0]) {
        projects.push({
          id: String(projData[i][0]),
          category: String(projData[i][1] || ''),
          company: String(projData[i][2] || ''),
          title: String(projData[i][3] || ''),
          status: String(projData[i][4] || '계획중'),
          progress: Number(projData[i][5] || 0),
          updatedAt: String(projData[i][6] || ''),
          description: String(projData[i][7] || '')
        });
      }
    }
  }

  // 아이디어 시트 읽기
  var ideaSheet = sheet.getSheetByName("Ideas") || sheet.insertSheet("Ideas");
  var ideaData = ideaSheet.getDataRange().getValues();
  var ideas = [];
  if (ideaData.length > 1) {
    for (var j = 1; j < ideaData.length; j++) {
      if (ideaData[j][0]) {
        ideas.push({
          id: String(ideaData[j][0]),
          category: String(ideaData[j][1] || ''),
          title: String(ideaData[j][2] || ''),
          content: String(ideaData[j][3] || ''),
          linkUrl: String(ideaData[j][4] || ''),
          createdAt: String(ideaData[j][5] || '')
        });
      }
    }
  }

  var result = {
    status: 'success',
    projects: projects,
    ideas: ideas,
    syncedAt: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    // Projects 시트 업데이트
    var projSheet = sheet.getSheetByName("Projects") || sheet.insertSheet("Projects");
    projSheet.clear();
    projSheet.appendRow(["ID", "카테고리", "회사/소속", "프로젝트명", "상태", "진행률(%)", "수정일", "설명"]);
    
    if (data.projects && data.projects.length > 0) {
      data.projects.forEach(function(p) {
        projSheet.appendRow([
          p.id,
          p.category,
          p.company,
          p.title,
          p.status,
          p.progress,
          p.updatedAt,
          p.description
        ]);
      });
    }

    // Ideas 시트 업데이트
    var ideaSheet = sheet.getSheetByName("Ideas") || sheet.insertSheet("Ideas");
    ideaSheet.clear();
    ideaSheet.appendRow(["ID", "카테고리", "아이디어 제목", "상세 내용", "웹 링크(URL)", "생성일"]);
    
    if (data.ideas && data.ideas.length > 0) {
      data.ideas.forEach(function(i) {
        ideaSheet.appendRow([
          i.id,
          i.category,
          i.title,
          i.content,
          i.linkUrl || '',
          i.createdAt
        ]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '성공적으로 구글 시트에 백업되었습니다.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Google Apps Script (GAS) 설정 가이드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Step Guide */}
          <div className="bg-indigo-50/80 rounded-xl p-4 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center space-x-1.5 text-sm">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>구글 시트 Web App 생성 4단계</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-xs leading-relaxed">
              <li>
                새 <strong className="text-indigo-900">구글 스프레드시트(Google Sheets)</strong>를 만듭니다.
              </li>
              <li>
                상단 메뉴에서 <strong className="text-indigo-900">[확장 프로그램] &rarr; [Apps Script]</strong>를 클릭합니다.
              </li>
              <li>
                아래 복사 버튼을 눌러 스크립트 코드를 붙여넣고 <strong className="text-indigo-900">저장(Ctrl+S / Cmd+S)</strong>합니다.
              </li>
              <li>
                우측 상단 <strong className="text-indigo-900">[배포] &rarr; [새 배포]</strong> 클릭 &rarr; 종류 선택: <strong className="text-indigo-900">웹 앱</strong> &rarr; 액세스 권한: <strong className="text-indigo-900">모든 사용자(Anyone)</strong> 설정 후 배포하여 생성된 <strong className="text-indigo-900">웹 앱 URL</strong>을 이 앱의 설정에 붙여넣으세요!
              </li>
            </ol>
          </div>

          {/* Code Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Apps Script 소스코드 (Code.gs)</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : '코드 전체 복사'}</span>
              </button>
            </div>

            <div className="relative bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
