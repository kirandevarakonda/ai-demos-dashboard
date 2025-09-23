
export function weiToEth(wei: string): string {
  if (!wei || wei === '0') return '0';
  const weiBigInt = BigInt(wei);
  const ether = Number(weiBigInt) / 1e18;
  // Use toLocaleString for formatting and handle very small numbers
  if (ether < 0.00001 && ether > 0) {
    return ether.toExponential(4);
  }
  return ether.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}