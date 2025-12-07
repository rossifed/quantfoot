import React from 'react';
import { Card } from './Card';
import { TeamTransfer } from '@/types/team';

interface TeamTransfersProps {
  transfers: TeamTransfer[];
}

export const TeamTransfers: React.FC<TeamTransfersProps> = ({ transfers }) => {
  const getTypeStyle = (type: TeamTransfer['type']) => {
    switch (type) {
      case 'In':
        return 'bg-secondary/20 text-secondary';
      case 'Out':
        return 'bg-danger/20 text-danger';
      case 'Loan In':
        return 'bg-primary/20 text-primary';
      case 'Loan Out':
        return 'bg-accent/20 text-accent';
    }
  };

  return (
    <Card title="Transfers">
      <div className="space-y-2">
        {transfers.map((transfer, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline line */}
            {idx < transfers.length - 1 && (
              <div className="absolute left-[3.5rem] top-16 w-0.5 h-6 bg-gradient-to-b from-primary/50 to-transparent" />
            )}
            
            <div className="flex items-start gap-4 p-3 bg-dark-800/30 rounded-lg border border-dark-700 hover:border-primary/30 hover:bg-dark-800/50 transition-all">
              {/* Player Photo */}
              <img 
                src={transfer.playerPhoto} 
                alt={transfer.playerName}
                className="w-12 h-12 rounded-full bg-dark-700 flex-shrink-0"
              />
              
              {/* Transfer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white">{transfer.playerName}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeStyle(transfer.type)}`}>
                    {transfer.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2 text-sm">
                  <span className="text-gray-400">{transfer.from}</span>
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-white font-medium">{transfer.to}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(transfer.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="font-bold text-secondary">{transfer.fee}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
