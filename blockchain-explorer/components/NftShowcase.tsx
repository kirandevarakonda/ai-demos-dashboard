import React from 'react';
import type { Nft } from '../types';
import { NftIcon } from './icons/NftIcon';

interface NftShowcaseProps {
  nfts: Nft[];
  isLoading: boolean;
}

export const NftShowcase: React.FC<NftShowcaseProps> = ({ nfts, isLoading }) => {
  if (isLoading) {
    return <NftSkeleton />;
  }

  if (nfts.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-brand-border pt-4">
      <h4 className="text-sm text-brand-secondary mb-3">Recent NFT Acquisitions</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 -mb-2">
        {nfts.map(nft => (
          <div key={nft.id} className="flex-shrink-0 w-40 bg-brand-bg p-3 rounded-lg border border-brand-border">
            <div className="w-full h-24 bg-brand-surface rounded-md flex items-center justify-center mb-2">
              <NftIcon className="h-10 w-10 text-brand-secondary" />
            </div>
            <p className="text-sm font-semibold text-brand-text truncate" title={nft.name}>{nft.name || 'Unknown Collection'}</p>
            <p className="text-xs text-brand-secondary truncate">ID: {nft.tokenID}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const NftSkeleton: React.FC = () => (
    <div className="border-t border-brand-border pt-4 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-brand-border mb-3"></div>
        <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 bg-brand-bg p-3 rounded-lg border border-brand-border">
                    <div className="w-full h-24 bg-brand-surface rounded-md mb-2"></div>
                    <div className="h-4 bg-brand-border rounded w-5/6 mb-1"></div>
                    <div className="h-3 bg-brand-border rounded w-1/2"></div>
                </div>
            ))}
        </div>
    </div>
);