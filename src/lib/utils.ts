import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
}

export function formatDate(dateInput: string | number | Date | null | undefined): string {
  // Handle null or undefined cases
  if (dateInput === null || dateInput === undefined) {
    return 'No date';
  }
  
  try {
    let date: Date;
    
    // Handle Unix timestamp (number or numeric string)
    if (typeof dateInput === 'number' || (typeof dateInput === 'string' && /^\d+$/.test(dateInput))) {
      // Convert to number if it's a numeric string
      const timestamp = typeof dateInput === 'string' ? parseInt(dateInput, 10) : dateInput;
      
      // Check if timestamp is in seconds (less than 13 digits) or milliseconds
      if (timestamp < 10000000000) {
        // Timestamp is in seconds, convert to milliseconds
        date = new Date(timestamp * 1000);
      } else {
        // Timestamp is already in milliseconds
        date = new Date(timestamp);
      }
    } else if (dateInput instanceof Date) {
      // If it's already a Date object
      date = dateInput;
    } else {
      // Handle string date formats
      date = new Date(dateInput);
    }
    
    // Check if the resulting date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateInput}`);
      
      // Special handling for PostgreSQL timestamp format
      if (typeof dateInput === 'string' && dateInput.includes('T')) {
        // Try extracting just the date part
        const simplifiedDate = dateInput.split('T')[0];
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
    
    // Format the date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error(`Error formatting date: ${dateInput}`, error);
    return 'Invalid date';
  }
}

export function formatWalletId(walletId: string): string {
  return walletId.length > 15 ? `${walletId.slice(0, 15)}...` : walletId;
}
