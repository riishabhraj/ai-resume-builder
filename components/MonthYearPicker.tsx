'use client';

import React, { useState, useEffect } from 'react';

interface MonthYearPickerProps {
  value: string; // Format: "Feb 2025" or "Present"
  onChange: (value: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
  label?: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function MonthYearPicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  allowPresent = false,
  label
}: MonthYearPickerProps) {
  const [isPresent, setIsPresent] = useState(value === 'Present');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Parse existing value
  useEffect(() => {
    if (value === 'Present') {
      setIsPresent(true);
      setSelectedMonth('');
      setSelectedYear('');
    } else if (value) {
      // Parse "Feb 2025" format
      const parts = value.split(' ');
      if (parts.length === 2) {
        setSelectedMonth(parts[0]);
        setSelectedYear(parts[1]);
      }
      setIsPresent(false);
    }
  }, [value]);

  // Generate years (50 years in past + current year + 10 years in future)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 50; // Go back 50 years
  const endYear = currentYear + 10;   // Go forward 10 years
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i).sort((a, b) => b - a); // Descending order (newest first)

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month && selectedYear) {
      onChange(`${month} ${selectedYear}`);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedMonth && year) {
      onChange(`${selectedMonth} ${year}`);
    }
  };

  const handlePresentChange = (checked: boolean) => {
    setIsPresent(checked);
    if (checked) {
      onChange('Present');
      setSelectedMonth('');
      setSelectedYear('');
    } else {
      onChange('');
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-brand-white mb-2">{label}</label>
      )}

      {!isPresent ? (
        <div className="grid grid-cols-2 gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan appearance-none cursor-pointer hover:border-gray-500 transition-colors"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300B4D8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="" disabled>Month</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan appearance-none cursor-pointer hover:border-gray-500 transition-colors"
            size={1}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300B4D8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="" disabled>Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="px-4 py-3 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 rounded-lg text-sm font-medium text-center">
          Present
        </div>
      )}
      
      {allowPresent && (
        <label className="flex items-center space-x-2 mt-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(e) => handlePresentChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-cyan focus:ring-2 focus:ring-brand-cyan focus:ring-offset-0"
          />
          <span className="text-sm text-brand-white group-hover:text-brand-cyan transition-colors">Currently working here</span>
        </label>
      )}
    </div>
  );
}

