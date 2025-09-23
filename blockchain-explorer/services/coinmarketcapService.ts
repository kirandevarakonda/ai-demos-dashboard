import type { CoinMarketCapResponse, CoinMarketCapQuote } from '../types';

// The API key provided by the user.
const COINMARKETCAP_API_KEY = '12111230-7ffb-462b-81f6-5134923e4c41';

// Using a different proxy to bypass CORS issues when calling the API from the browser.
const PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
const API_BASE_URL = 'https://pro-api.coinmarketcap.com';
const API_ENDPOINT = '/v1/cryptocurrency/quotes/latest';

export async function fetchCurrencyQuotes(symbols: string[]): Promise<{ [symbol: string]: CoinMarketCapQuote }> {
  const targetUrl = `${API_BASE_URL}${API_ENDPOINT}?symbol=${symbols.join(',')}`;
  // This proxy does not require the URL to be encoded.
  const requestUrl = `${PROXY_URL}${targetUrl}`;

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.status?.error_message || 'Failed to fetch data from CoinMarketCap API.');
    }

    const data: CoinMarketCapResponse = await response.json();
    
    if (data.status.error_code !== 0) {
        throw new Error(data.status.error_message || 'CoinMarketCap API returned an error.');
    }

    return data.data;
  } catch (error) {
    console.error("CoinMarketCap API Error:", error);
    throw new Error('Could not fetch currency quotes.');
  }
}
