import React, { useState } from 'react';
import { 
  FolderKanban, 
  PlayCircle, 
  CheckCircle2, 
  Lightbulb, 
  Plus, 
  Building2, 
  Tag, 
  TrendingUp,
  Clock,
  Star,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Project, Idea, CATEGORIES, ProjectStatus } from '../types';

interface DashboardViewProps {
  projects: Project[];
  ideas: Idea[];
  onOpenAddProject: () => void;
  onOpenAddIdea: () => void;
  onSelectProjectEdit: (project: Project) => void;
  onToggleStarProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectProgress: (id: string, newProgress: number) => void;
  onSaveIdea: (idea: Omit<Idea, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteIdea: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  ideas,
  onOpenAddProject,
  onOpenAddIdea,
  onSelectProjectEdit,
  onToggleStarProject,
  onDeleteProject,
  onUpdateProjectProgress,
  onSaveIdea,
  onDeleteIdea,
}) => {
  // Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedCompany, setSelectedCompany] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);

  // Quick Idea Bank State
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState<string>(CATEGORIES[0]);
  const [ideaContent, setIdeaContent] = useState('');
  const [ideaLinkUrl, setIdeaLinkUrl] = useState('');

  // Extract unique companies for sorting / filtering
  const distinctCompanies = Array.from(
    new Set(projects.map((p) => (p.company ? p.company.trim() : '미지정')).filter(Boolean))
  ).sort();

  // Filter projects logic
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === '전체' || project.category === selectedCategory;
    const matchesCompany = selectedCompany === '전체' || (project.company || '미지정') === selectedCompany;
    const matchesStatus = selectedStatus === '전체' || project.status === selectedStatus;
    const matchesStarred = !onlyStarred || Boolean(project.isStarred);
    const matchesSearch =
      searchQuery.trim() === '' ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCompany && matchesStatus && matchesStarred && matchesSearch;
  });

  // Handle Quick Idea Submit
  const handleQuickIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaContent.trim()) return;

    onSaveIdea({
      category: ideaCategory,
      title: ideaTitle.trim(),
      content: ideaContent.trim(),
      linkUrl: ideaLinkUrl.trim() || undefined,
    });

    setIdeaTitle('');
    setIdeaContent('');
    setIdeaLinkUrl('');
  };

  // Helper for status badge styling
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case '진행중':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case '완료':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '보류':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '계획중':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const totalProjectsCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === '진행중').length;
  const starredCount = projects.filter((p) => p.isStarred).length;
  const totalIdeasCount = ideas.length;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner: Simple buttons only as requested */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white tracking-tight">SC Projects 관제 센터</h2>
            <p className="text-xs text-slate-400">카테고리 인덱스 및 스타 프로젝트 통합 관리</p>
          </div>
        </div>

        {/* Buttons: Simple 새 프로젝트 등록, 새 아이디어 등록 */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenAddProject}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>새 프로젝트 등록</span>
          </button>
          <button
            onClick={onOpenAddIdea}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>새 아이디어 등록</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          onClick={() => { setSelectedStatus('전체'); setOnlyStarred(false); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">총 프로젝트</span>
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalProjectsCount}</div>
        </div>

        <div 
          onClick={() => { setSelectedStatus('진행중'); setOnlyStarred(false); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">진행중 프로젝트</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{inProgressCount}</div>
        </div>

        <div 
          onClick={() => setOnlyStarred(!onlyStarred)}
          className={`rounded-2xl p-4 border transition-all cursor-pointer ${
            onlyStarred 
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30' 
              : 'bg-white border-slate-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-900">스타 프로젝트 (★)</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{starredCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">아이디어 Bank</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{totalIdeasCount}</div>
        </div>
      </div>

      {/* 3. Category Index Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs md:text-sm text-slate-900">프로젝트 카테고리 인덱스</h3>
          </div>
          {selectedCategory !== '전체' && (
            <button
              onClick={() => setSelectedCategory('전체')}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              전체 카테고리 보기
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('전체')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === '전체'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 ({projects.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            const inProg = projects.filter((p) => p.category === cat && p.status === '진행중').length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
                {inProg > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title={`진행중 ${inProg}개`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Project Management Bento Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm space-y-4">
        {/* Sorting & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">프로젝트 목록</h3>
              <p className="text-[11px] text-slate-500">회사별 정렬 및 스타(★) 마크 분류 지원</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="프로젝트, 회사 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Company Sorting/Filtering */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="전체">회사 전체 ({distinctCompanies.length}개사)</option>
                {distinctCompanies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Toggle Button */}
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border ${
                onlyStarred
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-slate-950' : 'text-amber-500'}`} />
              <span>★ 스타만 보기</span>
            </button>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="전체">상태 전체</option>
              <option value="진행중">진행중</option>
              <option value="계획중">계획중</option>
              <option value="완료">완료</option>
              <option value="보류">보류</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium">조회 조건에 해당하는 프로젝트가 없습니다.</p>
            <button
              onClick={onOpenAddProject}
              className="mt-3 inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 프로젝트 추가</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const isInProgress = project.status === '진행중';

              return (
                <div
                  key={project.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 relative group ${
                    isInProgress
                      ? 'bg-white border-emerald-300/80 shadow-sm hover:border-emerald-400 hover:shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {/* Card Header Top */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {/* Category Index Pill */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {project.category}
                        </span>

                        {/* Company Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                          <Building2 className="w-2.5 h-2.5 text-slate-400" />
                          <span>{project.company}</span>
                        </span>
                      </div>

                      {/* Star Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStarProject(project.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title={project.isStarred ? '스타 해제' : '스타 지정'}
                      >
                        <Star
                          className={`w-4 h-4 transition-transform active:scale-125 ${
                            project.isStarred
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Project Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => onSelectProjectEdit(project)}
                        className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2"
                      >
                        {project.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {project.description || '세부 설명이 없습니다.'}
                    </p>
                  </div>

                  {/* Progress & Bottom Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        수정일: {project.updatedAt}
                      </span>
                      <span className="font-bold text-indigo-600 font-mono text-[11px]">
                        {project.progress}%
                      </span>
                    </div>

                    {/* Interactive Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isInProgress ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    {/* Quick Progress Buttons & Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onUpdateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600"
                          title="진행률 -10%"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => onUpdateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600"
                          title="진행률 +10%"
                        >
                          +10
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onSelectProjectEdit(project)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Idea Bank Section (Integrated Directly on Main Dashboard) */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">아이디어 Bank (대시보드 즉시 입력)</h3>
            <p className="text-[11px] text-slate-500">생각나는 아이디어를 카테고리와 함께 등록하세요</p>
          </div>
        </div>

        {/* Idea Form & List Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleQuickIdeaSubmit} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>새 아이디어 한줄 등록</span>
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">카테고리 선택</label>
              <select
                value={ideaCategory}
                onChange={(e) => setIdeaCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">아이디어 제목 *</label>
              <input
                type="text"
                placeholder="아이디어 요약 제목"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">아이디어 설명 *</label>
              <textarea
                rows={3}
                placeholder="어떤 가치가 있는지 구체적인 생각 노트를 남기세요"
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">참고 URL (선택)</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={ideaLinkUrl}
                onChange={(e) => setIdeaLinkUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 transition-all shadow-sm active:scale-95"
            >
              <Lightbulb className="w-3.5 h-3.5 fill-slate-950" />
              <span>아이디어 저장</span>
            </button>
          </form>

          {/* Ideas List Grid */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>저장된 아이디어 ({ideas.length}건)</span>
            </div>

            {ideas.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">등록된 아이디어가 없습니다. 첫 아이디어를 입력해 보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 border border-amber-200">
                          {idea.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {idea.createdAt}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs text-slate-900 mt-1 line-clamp-1">
                        {idea.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                        {idea.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      {idea.linkUrl ? (
                        <a
                          href={idea.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>링크 바로가기</span>
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => onDeleteIdea(idea.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                        title="아이디어 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
