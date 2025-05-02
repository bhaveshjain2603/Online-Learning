import React from 'react';

interface ProgressBarProps {
  progress: number;
  resumeTime?: number | null;
  duration: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  resumeTime, 
  duration 
}) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        {resumeTime && duration > 0 && (
          <div 
            className="resume-marker"
            style={{ left: `${(resumeTime / duration) * 100}%` }}
          />
        )}
      </div>
      <div className="progress-text">
        {progress}% completed
      </div>
    </div>
  );
};
