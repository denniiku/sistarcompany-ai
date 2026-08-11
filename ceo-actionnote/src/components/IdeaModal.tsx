import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ExternalLink } from 'lucide-react';
import { Idea, CATEGORIES } from '../types';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Idea | null;
}

export const IdeaModal: React.FC<IdeaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setTitle(initialData.title);
      setContent(initialData.content);
      setLinkUrl(initialData.linkUrl || '');
    } else {
      setCategory(CATEGORIES[0]);
      setTitle('');
      setContent('');
      setLinkUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onSave({
      id: initialData?.id,
      category,
      title: title.trim(),
      content: content.trim(),
      linkUrl: formattedUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <h3 className="font-bold text-base flex items-center space-x-2">
            <span>{initialData ? '아이디어 수정' : '새 아이디어 보관'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">카테고리 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">아이디어 제목 *</label>
            <input
              type="text"
              placeholder="스쳐 지나간 떠오른 구상을 적어보세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">상세 내용 (메모) *</label>
            <textarea
              rows={4}
              placeholder="아이디어의 구체적인 내용, 해결하고자 하는 문제, 구현 아이디어 등"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
              required
            />
          </div>

          {/* Web Link URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>관련 웹 링크 (URL)</span>
              <span className="text-[11px] text-slate-400 font-normal">선택 사항</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://example.com 또는 github.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full pr-8 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
              />
              <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('아이디어를 삭제하시겠습니까?')) {
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-amber-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>보관하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
