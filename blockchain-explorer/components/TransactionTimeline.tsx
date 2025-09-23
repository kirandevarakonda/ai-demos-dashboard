
import React from 'react';
import type { ExplainedTransaction } from '../types';
import { TransactionCard } from './TransactionCard';
import { SkeletonLoader } from './SkeletonLoader';

interface TransactionTimelineProps {
  transactions: ExplainedTransaction[];
  isLoading: boolean;
  walletAddress: string;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions, isLoading, walletAddress }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => <SkeletonLoader key={i} />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="relative border-l-2 border-brand-border ml-4 pl-8 space-y-10">
      {transactions.map((tx) => (
        <TransactionCard key={tx.hash} transaction={tx} walletAddress={walletAddress} />
      ))}
    </div>
  );
};
