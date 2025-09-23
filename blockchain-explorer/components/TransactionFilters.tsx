
import React from 'react';

type TransactionFilter = 'all' | 'incoming' | 'outgoing';

interface TransactionFiltersProps {
  currentFilter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  hasTransactions: boolean;
}

const filters: { id: TransactionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'outgoing', label: 'Outgoing' },
];

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({ currentFilter, onFilterChange, hasTransactions }) => {
  if (!hasTransactions) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-brand-text">Transactions</h3>
      <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-1">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
              currentFilter === filter.id
                ? 'bg-brand-primary text-white'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
