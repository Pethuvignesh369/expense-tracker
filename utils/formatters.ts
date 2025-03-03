// utils/formatters.ts

/**
 * Format a number as Indian Rupees
 * @param amount - Amount to format
 * @param showSymbol - Whether to include ₹ symbol (default: true)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatIndianCurrency = (
    amount: number, 
    showSymbol: boolean = true, 
    decimals: number = 2
  ): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return formatter.format(amount);
  };
  
  /**
   * Format a date string into a more user-friendly format
   * @param dateString - ISO date string
   * @param format - Format style ('short', 'medium', 'long')
   * @returns Formatted date string
   */
  export const formatDate = (
    dateString: string, 
    format: 'short' | 'medium' | 'long' = 'medium'
  ): string => {
    try {
      const date = new Date(dateString);
      
      if (format === 'short') {
        return date.toLocaleDateString('en-IN');
      } else if (format === 'medium') {
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } else {
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };