import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  // Handle null or undefined cases
  if (!dateString) {
    return 'No date';
  }
  
  try {
    // Try parsing the date - this might be an ISO string or another format
    const date = new Date(dateString);
    
    // Check if the resulting date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateString}`);
      
      // Check if it's a PostgreSQL timestamp format that needs special handling
      if (typeof dateString === 'string' && dateString.includes('T')) {
        // Try extracting just the date part
        const simplifiedDate = dateString.split('T')[0];
        const fallbackDate = new Date(simplifiedDate);
        
        if (!isNaN(fallbackDate.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).format(fallbackDate);
        }
      }
      
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return 'Invalid date';
  }
}

export function formatWalletId(walletId: string): string {
  return walletId.length > 15 ? `${walletId.slice(0, 15)}...` : walletId;
}
