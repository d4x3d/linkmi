/**
 * Mask email address for privacy
 * Shows first 3 characters and last part after @
 * Example: john.doe@example.com -> joh***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***';
  }

  const [localPart, domain] = email.split('@');

  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }

  const visiblePart = localPart.substring(0, 3);
  return `${visiblePart}***@${domain}`;
}

/**
 * Format amount in kobo to Naira
 */
export function formatNaira(amountInKobo: number): string {
  const amount = amountInKobo / 100;
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
