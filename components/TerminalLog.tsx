import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-rd-dark border border-rd-panel rounded-lg overflow-hidden flex flex-col h-64 md:h-full font-mono text-xs">
      <div className="bg-rd-panel px-4 py-2 border-b border-black flex justify-between items-center">
        <span className="text-rd-dim font-bold tracking-wider">SYSTEM_LOGS // RD-1 TRACEABILITY</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-black/50 text-rd-dim">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-fade-in">
            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
            <span className={`font-bold shrink-0 w-16 ${
              log.level === 'INFO' ? 'text-blue-500' :
              log.level === 'WARN' ? 'text-rd-warning' :
              log.level === 'ERROR' ? 'text-rd-danger' :
              'text-rd-accent'
            }`}>
              {log.level}
            </span>
            <span className="text-gray-400 break-all">{log.message}</span>
          </div>
        ))}
        <div className="flex gap-2 text-rd-accent animate-pulse">
          <span>_</span>
        </div>
      </div>
    </div>
  );
};