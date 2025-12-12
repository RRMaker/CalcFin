import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { WeaknessScores } from '../types';
import { Target } from 'lucide-react';

interface WeaknessMapProps {
  scores: WeaknessScores;
}

const WeaknessMap: React.FC<WeaknessMapProps> = ({ scores }) => {
  const data = Object.keys(scores).map((key) => ({
    subject: key,
    A: scores[key],
    fullMark: 100,
  }));

  // Calculate total grade estimate based on average weakness
  const averageWeakness = data.reduce((acc, curr) => acc + curr.A, 0) / data.length;
  
  const getGrade = (score: number) => {
    if (score === 0) return 'A+';
    if (score <= 10) return 'A';
    if (score <= 20) return 'A-';
    if (score <= 30) return 'B+';
    if (score <= 40) return 'B';
    if (score <= 50) return 'B-';
    if (score <= 60) return 'C+';
    if (score <= 70) return 'C';
    if (score <= 80) return 'D-';
    return 'F';
  };

  const grade = getGrade(averageWeakness);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" />
          Weakness Map
        </h2>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</span>
          <div className="text-3xl font-bold text-slate-800 leading-none">{grade}</div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Weakness Score"
              dataKey="A"
              stroke="#ef4444"
              strokeWidth={2}
              fill="#ef4444"
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-slate-500 mt-4">
        Larger area = Higher weakness (More practice needed)
      </p>
    </section>
  );
};

export default WeaknessMap;
