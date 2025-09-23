
import React from 'react';
import type { ExplainedTransaction } from '../types';
import { formatTimestamp, truncateAddress, weiToEth } from '../utils/formatters';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import { InOutIcon } from './icons/InOutIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface TransactionCardProps {
  transaction: ExplainedTransaction;
  walletAddress: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, walletAddress }) => {
  const { from, to, value, timeStamp, functionName, hash, explanation, isExplanationLoading } = transaction;

  const isOutgoing = from.toLowerCase() === walletAddress.toLowerCase();

  return (
    <div className="relative">
      <div className={`absolute -left-[42px] top-1 h-6 w-6 rounded-full flex items-center justify-center ${isOutgoing ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
        <InOutIcon isOutgoing={isOutgoing} className="h-4 w-4" />
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-5 shadow-md hover:border-brand-primary transition-colors duration-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
          <p className="text-sm text-brand-secondary font-mono">{formatTimestamp(timeStamp)}</p>
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-brand-primary hover:underline flex items-center gap-1 mt-1 md:mt-0"
          >
            Etherscan <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        </div>
        
        <div className="mb-5 flex items-start gap-3">
          <SparklesIcon className="h-6 w-6 text-brand-primary flex-shrink-0 mt-0.5" />
          {isExplanationLoading ? (
             <div className="w-full h-6 bg-brand-border rounded animate-pulse"></div>
          ) : (
            <p className="text-lg text-brand-text leading-relaxed">{explanation}</p>
          )}
        </div>

        <div className="border-t border-brand-border pt-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-secondary">Direction</dt>
              <dd className={`font-medium ${isOutgoing ? 'text-red-400' : 'text-green-400'}`}>
                {isOutgoing ? 'Outgoing' : 'Incoming'}
              </dd>
            </div>
             <div className="flex justify-between">
              <dt className="text-brand-secondary">Value</dt>
              <dd className="font-mono text-brand-text">{weiToEth(value)} ETH</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-secondary">From</dt>
              <dd className="font-mono text-brand-text">{truncateAddress(from)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-secondary">To</dt>
              <dd className="font-mono text-brand-text">{truncateAddress(to)}</dd>
            </div>
            <div className="flex justify-between col-span-1 sm:col-span-2">
              <dt className="text-brand-secondary">Method</dt>
              <dd className="font-mono text-brand-text truncate">{functionName.split('(')[0] || 'Direct Transfer'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
