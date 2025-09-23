import type { EtherscanTransaction, EtherscanNftTransaction, Nft } from '../types';

const ETHERSCAN_API_KEY = (window as any).process?.env?.ETHERSCAN_API_KEY || '4GDSKRIQVXMHUWV7Z25QAEK5DYS3Y6ECCA';

export async function fetchTransactions(address: string): Promise<EtherscanTransaction[]> {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Etherscan API.');
    }
    const data = await response.json();

    if (data.status === '0') {
      if (data.message === 'NOTOK' && data.result.includes('Invalid address format')) {
        throw new Error('Invalid Ethereum address format.');
      }
      if (data.result === 'Max rate limit reached') {
          throw new Error('Etherscan API rate limit reached. Please try again later.');
      }
      return []; 
    }
    
    return data.result as EtherscanTransaction[];
  } catch (error) {
    console.error("Etherscan API Error:", error);
    throw new Error('Could not fetch transactions. Please check the address and your Etherscan API key.');
  }
}

export async function fetchEthBalance(address: string): Promise<string> {
  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch balance from Etherscan API.');
    }
    const data = await response.json();

    if (data.status === '0') {
      throw new Error(data.result || 'Could not fetch balance.');
    }

    return data.result; // Balance is in wei
  } catch (error) {
    console.error("Etherscan API Error (Balance):", error);
    throw new Error('Could not fetch wallet balance.');
  }
}

export async function fetchNftTransactions(address: string): Promise<Nft[]> {
    const url = `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&page=1&offset=100&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch NFT data from Etherscan API.');
        }
        const data = await response.json();
    
        if (data.status === '0') {
          return []; 
        }

        const rawTxs = data.result as EtherscanNftTransaction[];
        
        // Filter for incoming transactions and create a unique set of NFTs
        const receivedNfts = new Map<string, Nft>();
        for (const tx of rawTxs) {
            if (tx.to.toLowerCase() === address.toLowerCase()) {
                const nftId = `${tx.contractAddress}-${tx.tokenID}`;
                if (!receivedNfts.has(nftId)) {
                    receivedNfts.set(nftId, {
                        id: nftId,
                        contractAddress: tx.contractAddress,
                        tokenID: tx.tokenID,
                        name: tx.tokenName,
                    });
                }
            }
        }

        // For this demo, we'll just show the most recent unique acquisitions
        // A full implementation would track sends to determine current holdings.
        return Array.from(receivedNfts.values()).slice(0, 10);
    } catch (error) {
        console.error("Etherscan API Error (NFTs):", error);
        throw new Error('Could not fetch NFT portfolio.');
    }
}