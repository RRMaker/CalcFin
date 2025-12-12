import React, { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import WeaknessMap from './components/WeaknessMap';
import ActionPlan from './components/ActionPlan';
import { analyzeStudentWork, UploadCategories } from './services/geminiService';
import { WeaknessScores, ActionItem, ActionStatus, Page } from './types';

// Default initial state
const INITIAL_SCORES: WeaknessScores = {
  "Limits": 0,
  "Derivatives": 0,
  "Chain Rule": 0,
  "Related Rates": 0,
  "Curve Sketching": 0,
  "Optimization": 0,
  "Trig Differentiation": 0,
  "Applications of Derivatives": 0,
  "Integrals": 0,
  "Applications of Integrals": 0
};

const STORAGE_KEY = 'calcfin_analysis_data_v1';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [weaknessScores, setWeaknessScores] = useState<WeaknessScores>(INITIAL_SCORES);
  const [actionPlan, setActionPlan] = useState<ActionItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.weaknessScores && parsed.actionPlan) {
          setWeaknessScores(parsed.weaknessScores);
          setActionPlan(parsed.actionPlan);
          setHasAnalyzed(true);
        }
      } catch (error) {
        console.error("Failed to parse saved analysis data", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist state to localStorage whenever it changes (if analyzed)
  useEffect(() => {
    if (hasAnalyzed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        weaknessScores,
        actionPlan
      }));
    }
  }, [weaknessScores, actionPlan, hasAnalyzed]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your analysis? This will delete your current progress and action plan.")) {
      localStorage.removeItem(STORAGE_KEY);
      setWeaknessScores(INITIAL_SCORES);
      setActionPlan([]);
      setHasAnalyzed(false);
      setCurrentPage('HOME');
    }
  };

  const handleAnalyze = async (categories: UploadCategories) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeStudentWork(categories);
      setWeaknessScores(result.weaknessScores);
      setActionPlan(result.actionPlan);
      setHasAnalyzed(true);
      setCurrentPage('HOME'); // Redirect to home to see results
    } catch (error) {
      alert("Failed to analyze work. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateTaskStatus = useCallback((id: number, newStatus: ActionStatus) => {
    setActionPlan(prev => {
      const newPlan = prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      );

      // Check if all items are complete
      const allComplete = newPlan.length > 0 && newPlan.every(item => item.status === 'complete');

      if (allComplete) {
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Set all weakness scores to 0 (A+ rating)
        setWeaknessScores(currentScores => {
          const zeroScores = { ...currentScores };
          Object.keys(zeroScores).forEach(key => {
            zeroScores[key] = 0;
          });
          return zeroScores;
        });
      } else if (newStatus === 'complete') {
        // If not all complete, but this item was just marked complete
        // Perform standard reduction
        const task = prev.find(item => item.id === id);
        // Only reduce if it wasn't already complete before (prev state)
        if (task && task.status !== 'complete') {
          setWeaknessScores(currentScores => ({
            ...currentScores,
            [task.topic]: Math.max(0, (currentScores[task.topic] || 0) - 10)
          }));
        }
      }

      return newPlan;
    });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="h-[500px]">
                <WeaknessMap scores={weaknessScores} />
             </div>
             {!hasAnalyzed && (
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800 mb-2 font-medium">No analysis data yet.</p>
                  <button 
                    onClick={() => setCurrentPage('UPLOAD')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    Go to Upload Page to start
                  </button>
                </div>
             )}
          </div>
        );
      case 'UPLOAD':
        return (
          <UploadSection 
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        );
      case 'ACTION_PLAN':
        return (
          <div className="h-[calc(100vh-200px)] animate-fade-in">
             <ActionPlan items={actionPlan} onUpdateStatus={handleUpdateTaskStatus} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        hasAnalyzed={hasAnalyzed}
        onReset={handleReset}
      />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {renderPage()}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-sm mt-auto">
        &copy; {new Date().getFullYear()} CalcFin. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;
