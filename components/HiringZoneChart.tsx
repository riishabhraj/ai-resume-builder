'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';

interface HiringZoneChartProps {
  score: number;
  size?: number;
}

const ZONES = [
  { name: 'Needs Improvement', min: 0, max: 59, color: '#ef4444', range: 60 },
  { name: 'Review Zone', min: 60, max: 74, color: '#eab308', range: 15 },
  { name: 'Competitive Zone', min: 75, max: 89, color: '#3b82f6', range: 15 },
  { name: 'Top Tier / Hiring Zone', min: 90, max: 100, color: '#10b981', range: 11 },
];

export default function HiringZoneChart({ score, size = 220 }: HiringZoneChartProps) {
  const getZone = (score: number) => {
    if (score >= 90) return ZONES[3];
    if (score >= 75) return ZONES[2];
    if (score >= 60) return ZONES[1];
    return ZONES[0];
  };

  const currentZone = getZone(score);
  const clampedScore = Math.max(0, Math.min(100, score));

  // Create data for radial chart - zones as background, then score
  const chartData = [
    // Zone 1: Needs Improvement (0-59)
    { name: 'zone1', value: 60, fill: ZONES[0].color, fillOpacity: 0.15 },
    // Zone 2: Review Zone (60-74)
    { name: 'zone2', value: 15, fill: ZONES[1].color, fillOpacity: 0.15 },
    // Zone 3: Competitive Zone (75-89)
    { name: 'zone3', value: 15, fill: ZONES[2].color, fillOpacity: 0.15 },
    // Zone 4: Top Tier (90-100)
    { name: 'zone4', value: 11, fill: ZONES[3].color, fillOpacity: 0.15 },
    // Current score indicator
    { name: 'score', value: clampedScore, fill: currentZone.color, fillOpacity: 1 },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius={size * 0.4}
            outerRadius={size * 0.48}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={8}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  fillOpacity={entry.fillOpacity} 
                />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-5xl font-bold text-white mb-1">{Math.round(clampedScore)}</div>
          <div className="text-xs text-gray-400 mb-2">/ 100</div>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            currentZone.color === '#10b981' ? 'text-green-400 bg-green-500/20 border border-green-500/50' :
            currentZone.color === '#3b82f6' ? 'text-blue-400 bg-blue-500/20 border border-blue-500/50' :
            currentZone.color === '#eab308' ? 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/50' :
            'text-red-400 bg-red-500/20 border border-red-500/50'
          }`}>
            {currentZone.name}
          </div>
        </div>
      </div>
      
      {/* Zone legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-sm">
        {ZONES.map((zone) => (
          <div
            key={zone.name}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
              currentZone.name === zone.name
                ? 'bg-gray-800/50 border border-gray-700 scale-105'
                : 'opacity-60'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: zone.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{zone.name}</div>
              <div className="text-xs text-gray-400">{zone.min}-{zone.max}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

