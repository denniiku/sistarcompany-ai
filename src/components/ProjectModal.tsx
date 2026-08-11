import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Star } from 'lucide-react';
import { Project, ProjectStatus, CATEGORIES, PROJECT_STATUSES } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [company, setCompany] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState<ProjectStatus>('계획중');
  const [progress, setProgress] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isStarred, setIsStarred] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setCompany(initialData.company);
      setTitle(initialData.title);
      setStatus(initialData.status);
      setProgress(initialData.progress);
      setDescription(initialData.description || '');
      setIsStarred(Boolean(initialData.isStarred));
    } else {
      setCategory(CATEGORIES[0]);
      setCompany('SISTAR Group');
      setTitle('');
      setStatus('계획중');
      setProgress(0);
      setDescription('');
      setIsStarred(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id,
      category,
      company: company.trim() || 'SISTAR Group',
      title: title.trim(),
      status,
      progress: Number(progress),
      description: description.trim(),
      isStarred,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base">
              {initialData ? '프로젝트 수정' : '새 프로젝트 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Category & Star */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">카테고리 인덱스 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">스타(중요도) 마크</label>
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`w-full px-3 py-2 rounded-xl border flex items-center justify-center space-x-2 font-semibold transition-all ${
                  isStarred
                    ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span>{isStarred ? '스타 프로젝트 (중요)' : '일반 프로젝트'}</span>
              </button>
            </div>
          </div>

          {/* Company / Org */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">회사명 / 소속 *</label>
            <input
              type="text"
              placeholder="예: SISTAR Group, Qubit Lab, Core AI Lab"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">프로젝트명 *</label>
            <input
              type="text"
              placeholder="프로젝트명을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              required
            />
          </div>

          {/* Status & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">진행 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">진행률 ({progress}%)</label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600"
                  >
                    +10%
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">상세 설명 / 메모</label>
            <textarea
              rows={3}
              placeholder="프로젝트 주요 목표 및 설명 메모"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>저장하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

