import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  FileText,
  FileBox,
  Layers,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, SourceFile } from '../data/androidProjectSource';

interface CodeExplorerProps {
  initialFilePath?: string;
  onDownloadProjectZip: () => void;
}

export default function CodeExplorer({ initialFilePath, onDownloadProjectZip }: CodeExplorerProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    initialFilePath || 'app/build.gradle.kts'
  );
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'app': true,
    'app/src/main': true,
    'app/src/main/java': true,
    'data': true,
    'domain': true,
    'ui': true,
    'viewmodel': true,
  });

  const selectedFile =
    ANDROID_PROJECT_FILES.find(f => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.kt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'gradle':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300';
      case 'manifest':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300';
      case 'data':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300';
      case 'domain':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'ui':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300';
      case 'viewmodel':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 px-2 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Дерево файлів проєкту Android Studio
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
              Kotlin • Jetpack Compose
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Готові до копіювання файли архітектури Clean Architecture (Data, Domain, Presentation).
          </p>
        </div>

        <button
          onClick={onDownloadProjectZip}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Завантажити весь проєкт (.ZIP)</span>
        </button>
      </div>

      {/* Main Two-Column Code Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        {/* Left Column: File Tree & Search */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex flex-col shadow-sm">
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Пошук файлу або класу..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5 flex items-center justify-between">
            <span>Файли ({filteredFiles.length})</span>
            <span className="text-[10px] font-normal">SDK 35 • Compose</span>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[560px]">
            {filteredFiles.map(file => {
              const isSelected = file.path === selectedFile?.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-medium'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium capitalize shrink-0 ${getCategoryBadge(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate pl-5">
                    {file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-lg">
          {/* File Header Bar */}
          <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-200 font-bold">{selectedFile.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${getCategoryBadge(selectedFile.category)}`}>
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопійовано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопіювати</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSingleFile}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
                title="Завантажити цей файл"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px] p-4 font-mono text-xs text-zinc-300 leading-relaxed bg-[#0d1117]">
            <pre className="flex">
              {/* Line numbers column */}
              <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800 space-y-0.5 font-mono">
                {selectedFile.content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code lines */}
              <code className="pl-4 text-zinc-200 block whitespace-pre">
                {selectedFile.content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
