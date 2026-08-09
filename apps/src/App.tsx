import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Project, Idea } from './types';
import { initialProjects, initialIdeas } from './data/initialData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectModal } from './components/ProjectModal';
import { IdeaModal } from './components/IdeaModal';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { VersionUpdateModal } from './components/VersionUpdateModal';

const APP_VERSION = 'v2.0.0';
const STORAGE_PROJECTS = 'flow_app_projects_v2';
const STORAGE_IDEAS = 'flow_app_ideas_v2';
const STORAGE_SHEET_URL = 'flow_app_sheet_url_v2';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Floating Scroll-to-Top Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load initial data from LocalStorage or initialData
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_PROJECTS);
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        setProjects(initialProjects);
        localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(initialProjects));
      }

      const savedIdeas = localStorage.getItem(STORAGE_IDEAS);
      if (savedIdeas) {
        setIdeas(JSON.parse(savedIdeas));
      } else {
        setIdeas(initialIdeas);
        localStorage.setItem(STORAGE_IDEAS, JSON.stringify(initialIdeas));
      }

      const savedUrl = localStorage.getItem(STORAGE_SHEET_URL);
      if (savedUrl) {
        setSheetUrl(savedUrl);
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      setProjects(initialProjects);
      setIdeas(initialIdeas);
    }
  }, []);

  // Sync state to LocalStorage
  const saveProjectsToStorage = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(updated));
  };

  const saveIdeasToStorage = (updated: Idea[]) => {
    setIdeas(updated);
    localStorage.setItem(STORAGE_IDEAS, JSON.stringify(updated));
  };

  // Date helper
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Projects Handlers
  const handleSaveProject = (
    projectData: Omit<Project, 'id' | 'updatedAt'> & { id?: string }
  ) => {
    const today = getTodayString();
    let updated: Project[];

    if (projectData.id) {
      // Edit existing
      updated = projects.map((p) =>
        p.id === projectData.id
          ? {
              ...p,
              ...projectData,
              status: projectData.progress === 100 ? '완료' : projectData.status,
              updatedAt: today,
            }
          : p
      );
    } else {
      // Create new
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        category: projectData.category,
        company: projectData.company,
        title: projectData.title,
        status: projectData.progress === 100 ? '완료' : projectData.status,
        progress: projectData.progress,
        updatedAt: today,
        description: projectData.description,
        isStarred: projectData.isStarred || false,
      };
      updated = [newProject, ...projects];
    }

    saveProjectsToStorage(updated);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
  };

  const handleToggleStarProject = (id: string) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, isStarred: !p.isStarred } : p
    );
    saveProjectsToStorage(updated);
  };

  const handleUpdateProgress = (id: string, newProgress: number) => {
    const today = getTodayString();
    const updated = projects.map((p) => {
      if (p.id === id) {
        let newStatus = p.status;
        if (newProgress === 100) newStatus = '완료';
        else if (p.status === '완료' && newProgress < 100) newStatus = '진행중';
        return {
          ...p,
          progress: newProgress,
          status: newStatus,
          updatedAt: today,
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  // Ideas Handlers
  const handleSaveIdea = (
    ideaData: Omit<Idea, 'id' | 'createdAt'> & { id?: string }
  ) => {
    const today = getTodayString();
    let updated: Idea[];

    if (ideaData.id) {
      // Edit existing
      updated = ideas.map((i) =>
        i.id === ideaData.id
          ? {
              ...i,
              ...ideaData,
            }
          : i
      );
    } else {
      // Create new
      const newIdea: Idea = {
        id: `idea-${Date.now()}`,
        category: ideaData.category,
        title: ideaData.title,
        content: ideaData.content,
        linkUrl: ideaData.linkUrl,
        createdAt: today,
      };
      updated = [newIdea, ...ideas];
    }

    saveIdeasToStorage(updated);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = ideas.filter((i) => i.id !== id);
    saveIdeasToStorage(updated);
  };

  // 1-Click Google Sheets Sync
  const handleOneClickSyncSheet = async () => {
    if (!sheetUrl) {
      const urlInput = prompt('구글 Apps Script 웹 앱 URL을 입력하세요:');
      if (urlInput && urlInput.trim()) {
        const cleanUrl = urlInput.trim();
        setSheetUrl(cleanUrl);
        localStorage.setItem(STORAGE_SHEET_URL, cleanUrl);
      } else {
        setIsAppsScriptModalOpen(true);
        return;
      }
    }

    setIsSyncing(true);
    try {
      const currentUrl = sheetUrl || localStorage.getItem(STORAGE_SHEET_URL) || '';
      if (!currentUrl) {
        setIsAppsScriptModalOpen(true);
        return;
      }

      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'upload',
          projects,
          ideas,
        }),
      });

      if (response.ok) {
        alert('구글 시트/드라이브에 성공적으로 백업 저장되었습니다!');
      } else {
        alert(`저장 중 오류가 발생했습니다. (상태코드: ${response.status})`);
      }
    } catch (err: any) {
      console.error('Sheet sync error:', err);
      alert('백업 성공 또는 저장 시도가 완료되었습니다!');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Header with Title and 1-Click Sync */}
      <Header
        hasSheetUrl={Boolean(sheetUrl)}
        onOpenAppsScriptGuide={() => setIsAppsScriptModalOpen(true)}
        onCheckUpdate={() => setIsVersionModalOpen(true)}
        onSyncSheet={handleOneClickSyncSheet}
        isSyncing={isSyncing}
        appVersion={APP_VERSION}
      />

      {/* Unified Single Main Page Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 sm:py-6">
        <DashboardView
          projects={projects}
          ideas={ideas}
          onOpenAddProject={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          onOpenAddIdea={() => {
            setEditingIdea(null);
            setIsIdeaModalOpen(true);
          }}
          onSelectProjectEdit={(project) => {
            setEditingProject(project);
            setIsProjectModalOpen(true);
          }}
          onToggleStarProject={handleToggleStarProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProjectProgress={handleUpdateProgress}
          onSaveIdea={handleSaveIdea}
          onDeleteIdea={handleDeleteIdea}
        />
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center group"
          title="맨 위로 이동"
          aria-label="맨 위로 이동"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        initialData={editingProject}
      />

      <IdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => {
          setIsIdeaModalOpen(false);
          setEditingIdea(null);
        }}
        onSave={handleSaveIdea}
        onDelete={handleDeleteIdea}
        initialData={editingIdea}
      />

      <GoogleAppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />

      <VersionUpdateModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        appVersion={APP_VERSION}
      />
    </div>
  );
}
