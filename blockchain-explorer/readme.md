# AI Blockchain Explainer

An application that analyzes an Ethereum wallet, fetches its latest transactions and assets (ETH balance, NFTs), and uses AI (Google Gemini) to generate plain-English explanations and summaries. It also includes an AI-powered chat for interactive analysis of the wallet's activity.

## Features

-   **AI-Powered Explanations**: Get simple, human-readable summaries for complex blockchain transactions.
-   **Comprehensive Wallet Overview**: See current ETH balance (with real-time USD value from CoinMarketCap), an AI-generated summary of activity, and a trust/risk assessment.
-   **NFT Showcase**: View a gallery of recently acquired NFTs.
-   **Interactive AI Chat**: Ask questions about the wallet in plain English (e.g., "What was the largest transaction?").
-   **Famous Wallets**: Instantly analyze well-known wallets like Vitalik Buterin's with a single click.
-   **Transaction Filtering**: Easily filter transactions by type (All, Incoming, Outgoing).
-   **Modern UI**: Clean, responsive, and intuitive interface built with React and Tailwind CSS.

## How to Set Up and Run Locally

This project is a static web application and does not require a complex build process. You just need a way to serve the files locally.

### Prerequisites

-   A modern web browser.
-   A local web server. If you don't have one, you can use:
    -   **VS Code Extension**: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
    -   **Node.js**: `npx serve`

### Step-by-Step Instructions

#### 1. Get API Keys

You need API keys from two services for the application to function correctly:

-   **Google Gemini API Key**: For all AI-powered features.
    -   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Click "**Create API key**" and copy your new key.

-   **Etherscan API Key**: For fetching transaction and balance data from the Ethereum blockchain.
    -   Create an account on [Etherscan](https://etherscan.io/).
    -   Navigate to your dashboard and go to "**API Keys**".
    -   Click "**Add**" to create a new API key.

#### 2. Configure Environment Variables

The application loads API keys from an `env.js` file in the root directory.

-   Create a new file named `env.js` in the main project folder (the same folder as `index.html`).
-   Copy and paste the following code into `env.js`, replacing the placeholder text with the keys you obtained in the previous step.

```javascript
// env.js

window.process = {
  env: {
    // Paste your Gemini API Key here
    API_KEY: 'YOUR_GEMINI_API_KEY',

    // Paste your Etherscan API Key here
    ETHERSCAN_API_KEY: 'YOUR_ETHERSCAN_API_KEY'
  }
};
```

**Important**: Do not commit your `env.js` file to version control. If you are using Git, you should add `env.js` to your `.gitignore` file.

#### 3. Serve the Application

-   Open your terminal or command prompt in the project's root directory.
-   If you have Node.js installed, run the following command:
    ```bash
    npx serve
    ```
-   If you are using the Live Server extension in VS Code, right-click on `index.html` and select "**Open with Live Server**".

#### 4. Open in Browser

-   Once the server is running, open your web browser and navigate to the local address it provides (usually `http://localhost:3000` or `http://localhost:5500`).

You should now see the AI Blockchain Explainer application running and ready to analyze wallet addresses!
