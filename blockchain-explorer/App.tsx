import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { fetchTransactions, fetchEthBalance, fetchNftTransactions } from './services/etherscanService';
import { getExplanationForTransaction, getWalletSummary, createChatWithTransactionContext } from './services/geminiService';
import { fetchCurrencyQuotes } from './services/coinmarketcapService';
import type { ExplainedTransaction, WalletSummary, Nft, ChatMessage, EtherscanTransaction } from './types';
import type { Chat } from '@google/genai';
import { WalletInput } from './components/WalletInput';
import { TransactionTimeline } from './components/TransactionTimeline';
import { LogoIcon } from './components/icons/LogoIcon';
import { GithubIcon } from './components/icons/GithubIcon';
import { FamousWallets } from './components/FamousWallets';
import { WalletSummaryCard } from './components/WalletSummaryCard';
import { TransactionFilters } from './components/TransactionFilters';
import { ChatWidget } from './components/ChatWidget';
import { weiToEth } from './utils/formatters';

const FAMOUS_WALLETS = [
  { name: 'Vitalik Buterin', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  { name: 'ENS Founder', address: '0xFe89cc7aBB2C4183643A54D6f16cec2c28e2891d' },
  { name: 'OpenSea Seaport', address: '0x00000000000000ADc04C56Bf30aC9d320d274401' },
];

type TransactionFilter = 'all' | 'incoming' | 'outgoing';

export default function App(): React.ReactNode {
  const [address, setAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<ExplainedTransaction[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [isNftsLoading, setIsNftsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>('all');
  
  // Chat state
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);


  const analyzeAddress = useCallback(async (walletAddressToAnalyze: string) => {
    if (!walletAddressToAnalyze) {
      setError('Please enter a valid Ethereum wallet address.');
      return;
    }
    setIsLoading(true);
    setIsSummaryLoading(true);
    setIsNftsLoading(true);
    setError(null);
    setTransactions([]);
    setWalletSummary(null);
    setNfts([]);
    setFilter('all');
    setChat(null);
    setChatHistory([]);

    try {
      // Fetch sequentially to respect Etherscan's rate limit.
      const rawTxs = await fetchTransactions(walletAddressToAnalyze);
      const balance = await fetchEthBalance(walletAddressToAnalyze);
      const rawNfts = await fetchNftTransactions(walletAddressToAnalyze);
      
      setNfts(rawNfts);
      setIsNftsLoading(false);
      
      setWalletSummary({ balance, summary: null, nfts: rawNfts, balanceUsd: null });

      // Fetch price data from CoinMarketCap
      try {
        const quotes = await fetchCurrencyQuotes(['ETH']);
        const ethPrice = quotes['ETH']?.quote?.USD?.price;
        if (ethPrice) {
          const balanceInEth = parseFloat(weiToEth(balance).replace(/,/g, ''));
          const balanceUsd = balanceInEth * ethPrice;
          setWalletSummary(prev => prev ? { ...prev, balanceUsd } : { balance, summary: null, nfts: rawNfts, balanceUsd });
        }
      } catch (priceError) {
        console.error('Could not fetch price data from CoinMarketCap:', priceError);
        // Silently fail, the USD balance will just not be shown.
      }
      
      // Generate wallet summary with NFT context
      try {
        const summaryText = await getWalletSummary(rawTxs, walletAddressToAnalyze, balance, rawNfts);
        setWalletSummary(prev => prev ? { ...prev, summary: summaryText } : { balance, summary: summaryText, nfts: rawNfts, balanceUsd: null });
      } catch (summaryError) {
        console.error('Failed to get wallet summary:', summaryError);
        setWalletSummary(prev => prev ? { ...prev, summary: 'Could not generate AI summary for this wallet.' } : { balance, summary: 'Could not generate AI summary for this wallet.', nfts: rawNfts, balanceUsd: null });
      } finally {
        setIsSummaryLoading(false);
      }

      if (rawTxs.length === 0) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // Setup AI chat with transaction context
      const chatInstance = createChatWithTransactionContext(rawTxs, walletAddressToAnalyze);
      setChat(chatInstance);

      const initialTxs: ExplainedTransaction[] = rawTxs.map(tx => ({
        ...tx,
        explanation: null,
        isExplanationLoading: true,
      }));
      setTransactions(initialTxs);
      setIsLoading(false);

      // Stream explanations for each transaction
      for (let i = 0; i < initialTxs.length; i++) {
        try {
          const explanation = await getExplanationForTransaction(initialTxs[i], walletAddressToAnalyze);
          setTransactions(prevTxs => {
            const newTxs = [...prevTxs];
            if (newTxs[i]) {
                newTxs[i] = { ...newTxs[i], explanation, isExplanationLoading: false };
            }
            return newTxs;
          });
        } catch (explanationError) {
          console.error('Failed to get explanation for transaction:', initialTxs[i].hash, explanationError);
          setTransactions(prevTxs => {
            const newTxs = [...prevTxs];
            if (newTxs[i]) {
                newTxs[i] = { ...newTxs[i], explanation: 'Could not generate explanation.', isExplanationLoading: false };
            }
            return newTxs;
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setTransactions([]);
      setWalletSummary(null);
      setNfts([]);
      setIsLoading(false);
      setIsSummaryLoading(false);
      setIsNftsLoading(false);
    }
  }, []);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chat) return;

    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      const result = await chat.sendMessageStream({ message });
      let currentModelResponse = "";
      setChatHistory(prev => [...prev, { role: 'model', content: "" }]); 
      
      for await (const chunk of result) {
        currentModelResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = currentModelResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[newHistory.length - 1].role === 'model') {
           newHistory[newHistory.length - 1].content = "Sorry, I encountered an error. Please try again.";
        } else {
           newHistory.push({ role: 'model', content: "Sorry, I encountered an error. Please try again." });
        }
        return newHistory;
      });
    } finally {
      setIsChatLoading(false);
    }
  }, [chat]);


  const handleFormSubmit = useCallback(() => {
    analyzeAddress(address);
  }, [address, analyzeAddress]);
  
  const handleSelectFamousWallet = useCallback((newAddress: string) => {
    setAddress(newAddress);
    analyzeAddress(newAddress);
  }, [analyzeAddress]);

  const filteredTransactions = useMemo(() => {
    const lowerCaseAddress = address.toLowerCase();
    if (filter === 'all') return transactions;
    return transactions.filter(tx => {
      const isOutgoing = tx.from.toLowerCase() === lowerCaseAddress;
      return filter === 'outgoing' ? isOutgoing : !isOutgoing;
    });
  }, [transactions, filter, address]);

  return (
    <>
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <LogoIcon className="h-10 w-10 text-brand-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-text tracking-tight">
                    AI Blockchain Explainer
                </h1>
            </div>
            <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/prompting_in_applications/react" target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-primary transition-colors">
                <GithubIcon className="h-7 w-7" />
            </a>
        </header>

        <main>
          <p className="text-center text-brand-secondary mb-6 max-w-2xl mx-auto">
            Enter an Ethereum wallet address to analyze its transactions and assets. Our AI provides simple, plain-English explanations.
          </p>

          <FamousWallets 
            wallets={FAMOUS_WALLETS} 
            onSelect={handleSelectFamousWallet} 
            isLoading={isLoading || isSummaryLoading}
          />
          
          <WalletInput 
            address={address}
            setAddress={setAddress}
            onAnalyze={handleFormSubmit}
            isLoading={isLoading || isSummaryLoading}
          />

          {error && (
            <div className="mt-6 text-center bg-red-900/20 border border-brand-danger text-brand-danger p-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <WalletSummaryCard 
              summary={walletSummary} 
              isLoading={isSummaryLoading} 
              nfts={nfts}
              isNftsLoading={isNftsLoading}
          />
          
          <TransactionFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            hasTransactions={transactions.length > 0}
          />

          <TransactionTimeline 
            transactions={filteredTransactions} 
            isLoading={isLoading && transactions.length === 0}
            walletAddress={address}
          />
        </main>
      </div>
    </div>
    <ChatWidget 
        isReady={!!chat}
        history={chatHistory}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
    />
    </>
  );
}