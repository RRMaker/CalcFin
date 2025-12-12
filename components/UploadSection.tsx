import React, { useRef, useState } from 'react';
import { Upload, FileText, X, FileImage, FileIcon, BookOpen, PenTool, GraduationCap } from 'lucide-react';
import { UploadCategories } from '../services/geminiService';

interface UploadSectionProps {
  onAnalyze: (categories: UploadCategories) => void;
  isAnalyzing: boolean;
}

interface UploadCardProps {
  title: string; 
  icon: React.ReactNode;
  onFileSelect: (files: FileList | null) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ title, icon, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={handleClick}
      className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group h-32 w-full md:w-48 flex-shrink-0"
    >
      <div className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors transform group-hover:scale-110 duration-200">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{title}</span>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        multiple
        accept="image/*,.pdf"
        onChange={(e) => onFileSelect(e.target.files)}
      />
    </div>
  );
};

interface CategoryBlockProps {
  title: string;
  icon: React.ReactNode;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const CategoryBlock: React.FC<CategoryBlockProps> = ({ title, icon, files, setFiles }) => {
  const handleFileSelect = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Upload Button */}
        <div className="flex-shrink-0">
          <UploadCard title={title} icon={icon} onFileSelect={handleFileSelect} />
        </div>

        {/* Right: File List */}
        <div className="flex-grow">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            {title} Uploads
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-normal border border-slate-200">
              {files.length}
            </span>
          </h3>
          
          {files.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-2">
              No files uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {file.type.includes('image') ? <FileImage className="w-3 h-3 text-purple-500 flex-shrink-0" /> : <FileIcon className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    <span className="text-slate-700 truncate max-w-[120px]">{file.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [exams, setExams] = useState<File[]>([]);
  const [quizzes, setQuizzes] = useState<File[]>([]);
  const [homework, setHomework] = useState<File[]>([]);
  const [notes, setNotes] = useState<File[]>([]);

  const totalFiles = exams.length + quizzes.length + homework.length + notes.length;

  const handleAnalyzeClick = () => {
    onAnalyze({ exams, quizzes, homework, notes });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Materials
        </h2>
        
        <div className="space-y-4">
          <CategoryBlock 
            title="Exams" 
            icon={<GraduationCap className="w-8 h-8" />} 
            files={exams} 
            setFiles={setExams} 
          />
          <CategoryBlock 
            title="Quizzes" 
            icon={<FileText className="w-8 h-8" />} 
            files={quizzes} 
            setFiles={setQuizzes} 
          />
          <CategoryBlock 
            title="Homework" 
            icon={<PenTool className="w-8 h-8" />} 
            files={homework} 
            setFiles={setHomework} 
          />
          <CategoryBlock 
            title="Notes" 
            icon={<BookOpen className="w-8 h-8" />} 
            files={notes} 
            setFiles={setNotes} 
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || totalFiles === 0}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all shadow-md flex items-center justify-center gap-2
              ${isAnalyzing || totalFiles === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform active:scale-[0.99]'
              }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing your documents...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze My Work
              </>
            )}
          </button>
          {totalFiles === 0 && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Please upload at least one file to begin analysis.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default UploadSection;
