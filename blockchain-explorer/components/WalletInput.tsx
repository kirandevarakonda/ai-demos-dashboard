
import React from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface WalletInputProps {
  address: string;
  setAddress: (address: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const WalletInput: React.FC<WalletInputProps> = ({ address, setAddress, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-primary transition-all duration-200">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Ethereum Wallet Address (e.g., 0x...)"
          className="w-full bg-transparent text-brand-text placeholder-brand-secondary focus:outline-none px-3 py-2 text-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center bg-brand-primary text-white font-semibold rounded-md px-6 py-2.5 h-full hover:bg-blue-500 disabled:bg-brand-secondary disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <SearchIcon className="h-5 w-5 mr-2" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
