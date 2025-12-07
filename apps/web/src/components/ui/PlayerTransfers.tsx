import React from 'react';
import { Card } from './Card';
import { Transfer } from '@/types/player';

interface PlayerTransfersProps {
  transfers: Transfer[];
}

export const PlayerTransfers: React.FC<PlayerTransfersProps> = ({ transfers }) => {
  return (
    <Card title="Transfer History">
      <div className="space-y-3">
        {transfers.map((transfer, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline line */}
            {idx < transfers.length - 1 && (
              <div className="absolute left-[4.5rem] top-12 w-0.5 h-6 bg-gradient-to-b from-primary/50 to-transparent" />
            )}
            
            <div className="flex items-start gap-4 p-4 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-primary/30 hover:bg-dark-800 transition-all">
              {/* Date */}
              <div className="flex-shrink-0 pt-1">
                <div className="text-xs font-medium text-primary">
                  {new Date(transfer.date).toLocaleDateString('en-GB', { 
                    day: '2-digit',
                    month: 'short'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transfer.date).getFullYear()}
                </div>
              </div>
              
              {/* Transfer flow */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-medium text-gray-400 text-sm truncate">{transfer.from}</p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{transfer.to}</p>
                  </div>
                </div>
                
                {/* Fee and type */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-dark-700 text-gray-400 rounded">
                    {transfer.type}
                  </span>
                  <span className="font-bold text-secondary text-sm whitespace-nowrap">
                    {transfer.fee}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
