
import React from 'react';

interface FamousWallet {
  name: string;
  address: string;
}

interface FamousWalletsProps {
  wallets: FamousWallet[];
  onSelect: (address: string) => void;
  isLoading: boolean;
}

export const FamousWallets: React.FC<FamousWalletsProps> = ({ wallets, onSelect, isLoading }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
        <span className="text-sm text-brand-secondary mr-2">Try:</span>
        {wallets.map(wallet => (
            <button
                key={wallet.name}
                onClick={() => onSelect(wallet.address)}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-brand-surface border border-brand-border rounded-full hover:bg-brand-border hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {wallet.name}
            </button>
        ))}
    </div>
  );
};
