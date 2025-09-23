import { GoogleGenAI, Chat } from "@google/genai";
import type { EtherscanTransaction, Nft } from "../types";
import { weiToEth } from "../utils/formatters";

const API_KEY = (window as any).process?.env?.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not configured. Please create an env.js file with your API_KEY. See readme.md for instructions.");
    throw new Error("API_KEY is not configured. See readme.md for setup instructions.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = 'gemini-2.5-flash';

export async function getExplanationForTransaction(transaction: EtherscanTransaction, walletAddress: string): Promise<string> {
  const { from, to, value, functionName, timeStamp } = transaction;

  const ethValue = weiToEth(value);
  const transactionDate = new Date(parseInt(timeStamp, 10) * 1000).toUTCString();
  const direction = from.toLowerCase() === walletAddress.toLowerCase() ? 'Outgoing' : 'Incoming';
  
  const parsedFunctionName = functionName.split('(')[0] || 'Direct Transfer';

  const prompt = `
    You are an expert in Ethereum blockchain analysis. Your task is to provide a single, simple, human-readable sentence explaining an Ethereum transaction.
    Be concise and clear, as if you're explaining it to someone new to crypto. Do not use technical jargon if it can be avoided.

    Analyze the following transaction data for the wallet address: ${walletAddress}

    - Transaction Direction: ${direction}
    - From Address: ${from}
    - To Address (could be a user wallet or a contract): ${to}
    - Value Transferred: ${ethValue} ETH
    - Method Called: "${parsedFunctionName}"
    - Date: ${transactionDate}

    Based on the data, provide a one-sentence explanation of what this transaction did from the perspective of the wallet address (${walletAddress}).

    Examples:
    - "This wallet sent 0.5 ETH to another address."
    - "This wallet received 2.1 ETH from another address."
    - "This wallet swapped ETH for a different token on a decentralized exchange."
    - "This wallet minted a new NFT from a contract."
    - "This wallet approved a smart contract to spend its tokens."
  `;

  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate explanation from Gemini API.");
  }
}


export async function getWalletSummary(
  transactions: EtherscanTransaction[], 
  walletAddress: string, 
  balanceInWei: string,
  nfts: Nft[]
): Promise<string> {
  if (transactions.length === 0 && nfts.length === 0) {
    return "This wallet has no recent transactions or NFTs to analyze. Its current balance is " + weiToEth(balanceInWei) + " ETH.";
  }
  const ethBalance = weiToEth(balanceInWei);

  const transactionSummaries = transactions.slice(0, 5).map(tx => {
    const direction = tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'out' : 'in';
    const ethValue = weiToEth(tx.value);
    const functionName = tx.functionName.split('(')[0] || 'Direct Transfer';
    return `- ${direction}: ${ethValue} ETH to/from ${direction === 'out' ? tx.to : tx.from}, method: ${functionName}`;
  }).join('\n');

  const nftSummary = nfts.length > 0
    ? `This wallet also holds ${nfts.length} different types of NFTs, with recent acquisitions from collections like '${nfts[0].name}'.`
    : 'This wallet does not appear to have any recent NFT activity.';

  const prompt = `
    You are an expert Ethereum blockchain analyst. Your task is to provide a high-level summary and a brief trust/risk assessment for an Ethereum wallet based on its recent activity and balance.
    The summary should be concise (2-3 sentences), easy to understand for a non-technical user, and presented in a friendly, narrative style.

    Analyze the following wallet data:
    - Wallet Address: ${walletAddress}
    - Current ETH Balance: ${ethBalance} ETH
    - NFT Holdings Summary: ${nftSummary}
    - Summary of its 5 most recent transactions:
    ${transactionSummaries}

    Based on this data, provide a summary covering:
    1. A general overview of the wallet's recent activity (e.g., "This wallet actively trades on decentralized exchanges," "This wallet seems to be an NFT enthusiast," or "This wallet primarily sends and receives ETH from other personal accounts.").
    2. An observation about its balance in relation to its activity.
    3. A simple, plain-English trust or risk signal (e.g., "This activity appears to be typical for a DeFi user.", "The high frequency of transfers to new addresses might warrant caution.", or "This looks like a standard, low-risk personal wallet.").

    Do not use technical jargon unless necessary. Frame the analysis from the perspective of someone wanting to understand the wallet's purpose and safety. Start the summary directly, without any preamble like "Based on the data...".
  `;

  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error (Wallet Summary):", error);
    throw new Error("Failed to generate wallet summary from Gemini API.");
  }
}

export function createChatWithTransactionContext(
    transactions: EtherscanTransaction[], 
    walletAddress: string
): Chat {
    const transactionContext = transactions.map((tx, i) => {
        return `
        Transaction ${i + 1}:
        - Hash: ${tx.hash}
        - From: ${tx.from}
        - To: ${tx.to}
        - Value: ${weiToEth(tx.value)} ETH
        - Function: ${tx.functionName.split('(')[0] || 'Direct Transfer'}
        - Timestamp: ${new Date(parseInt(tx.timeStamp, 10) * 1000).toUTCString()}
        `;
    }).join('\n');

    const systemInstruction = `You are an expert blockchain analyst assistant. The user is asking questions about the Ethereum wallet with address ${walletAddress}. 
    Use the following transaction data to answer their questions.
    Provide concise, accurate answers based ONLY on the provided transaction data. Do not invent information.
    If the data doesn't support an answer, say that you cannot answer based on the available information.
    Format your answers clearly using Markdown.

    <Transaction_Data>
    ${transactionContext}
    </Transaction_Data>
    `;

    const chat = ai.chats.create({
        model: textModel,
        config: { systemInstruction },
    });
    return chat;
}