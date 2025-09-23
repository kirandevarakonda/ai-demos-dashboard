import React from 'react';
import type { WalletSummary, Nft } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { weiToEth, formatUsd } from '../utils/formatters';
import { InfoIcon } from './icons/InfoIcon';
import { NftShowcase } from './NftShowcase';

interface WalletSummaryProps {
  summary: WalletSummary | null;
  isLoading: boolean;
  nfts: Nft[];
  isNftsLoading: boolean;
}

export const WalletSummaryCard: React.FC<WalletSummaryProps> = ({ summary, isLoading, nfts, isNftsLoading }) => {
  if (!summary && !isLoading) {
    return null;
  }
  
  if (isLoading) {
    return <WalletSummarySkeleton />;
  }
  
  if (!summary) return null;

  return (
    <div className="mb-8 p-5 bg-brand-surface border border-brand-border rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <InfoIcon className="h-6 w-6 text-brand-secondary mr-3" />
        <h2 className="text-xl font-bold text-brand-text">Wallet Overview</h2>
      </div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <p className="text-sm text-brand-secondary mb-1">Current Balance</p>
            <p className="text-2xl font-mono font-semibold text-brand-text">{weiToEth(summary.balance)} ETH</p>
            {summary.balanceUsd !== null && (
                 <p className="text-md text-brand-secondary font-mono">{formatUsd(summary.balanceUsd)}</p>
            )}
          </div>
          <div className="md:col-span-2 flex items-start gap-3 border-t md:border-t-0 md:border-l border-brand-border pt-4 md:pt-0 md:pl-4">
            <SparklesIcon className="h-6 w-6 text-brand-primary flex-shrink-0 mt-0.5" />
            <p className="text-brand-text leading-relaxed">
              {summary.summary || <span className="animate-pulse">Generating summary...</span>}
            </p>
          </div>
        </div>
        <NftShowcase nfts={nfts} isLoading={isNftsLoading} />
      </div>
    </div>
  );
};

const WalletSummarySkeleton: React.FC = () => (
  <div className="mb-8 p-5 bg-brand-surface border border-brand-border rounded-lg shadow-md animate-pulse">
    <div className="flex items-center mb-4">
        <div className="h-6 w-6 rounded-full bg-brand-border mr-3"></div>
        <div className="h-6 w-1/3 rounded bg-brand-border"></div>
      </div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-brand-border"></div>
            <div className="h-8 w-3/4 rounded bg-brand-border"></div>
            <div className="h-5 w-1/2 rounded bg-brand-border"></div>
          </div>
          <div className="md:col-span-2 flex items-start gap-3 border-t md:border-t-0 md:border-l border-brand-border pt-4 md:pt-0 md:pl-4">
             <div className="h-6 w-6 rounded-full bg-brand-border flex-shrink-0 mt-0.5"></div>
             <div className="w-full space-y-2">
              <div className="h-5 rounded bg-brand-border w-full"></div>
              <div className="h-5 rounded bg-brand-border w-5/6"></div>
             </div>
          </div>
        </div>
        <div className="border-t border-brand-border pt-4">
            <div className="h-4 w-1/4 rounded bg-brand-border mb-3"></div>
            <div className="flex gap-3">
                <div className="h-20 w-16 rounded-md bg-brand-border"></div>
                <div className="h-20 w-16 rounded-md bg-brand-border"></div>
                <div className="h-20 w-16 rounded-md bg-brand-border"></div>
            </div>
        </div>
      </div>
  </div>
);