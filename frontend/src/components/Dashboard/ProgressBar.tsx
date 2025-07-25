import React from 'react';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-tesla-gray rounded h-2 mt-2">
      <div
        className="bg-tesla-blue h-2 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 