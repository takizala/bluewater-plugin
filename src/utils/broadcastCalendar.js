/**
 * Core broadcast calendar utility functions
 * 
 * These functions handle the specific rules of broadcast calendars:
 * - Broadcast days start at 6am, not midnight
 * - Broadcast weeks start on Monday
 * - First week of a month is the first week containing any day of that month
 * - If the 1st of the month is a Sunday, the entire week belongs to that month
 */

/**
 * Adjusts a datetime to the correct broadcast day
 * Broadcast days run 6am to 5:59am the next calendar day
 */
export const adjustForBroadcastDay = (dateTime) => {
    const d = new Date(dateTime);
    const hours = d.getHours();
    
    // If time is between 12am and 5:59am, it belongs to the previous broadcast day
    if (hours < 6) {
      d.setDate(d.getDate() - 1);
    }
    
    return d;
  };
  
  /**
   * Gets broadcast month information for a given date
   */
  export const getBroadcastMonth = (date) => {
    // Create a copy of the date to avoid modifying the original
    const d = new Date(date);
    
    // Find the week containing the date
    const dayOfWeek = d.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const mondayOfCurrentWeek = new Date(d);
    mondayOfCurrentWeek.setDate(d.getDate() - daysToMonday);
    mondayOfCurrentWeek.setHours(0, 0, 0, 0);
    
    // Find the first day of the current standard month
    const firstDayOfCurrentMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    
    // Find the Monday of the week containing the first day of the current month
    const currentMonthDayOfWeek = firstDayOfCurrentMonth.getDay();
    const daysToSubtractCurrent = currentMonthDayOfWeek === 0 ? 6 : currentMonthDayOfWeek - 1;
    
    const firstMondayOfCurrentMonth = new Date(firstDayOfCurrentMonth);
    firstMondayOfCurrentMonth.setDate(firstDayOfCurrentMonth.getDate() - daysToSubtractCurrent);
    
    // If the first day of the month is Sunday, the broadcast month
    // starts the previous Monday
    if (currentMonthDayOfWeek === 0) {
      firstMondayOfCurrentMonth.setDate(firstMondayOfCurrentMonth.getDate() - 7);
    }
    
    // Find the first day of the next standard month
    const nextMonthYear = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
    const nextMonthMonth = d.getMonth() === 11 ? 0 : d.getMonth() + 1;
    const firstDayOfNextMonth = new Date(nextMonthYear, nextMonthMonth, 1);
    
    // Find the Monday of the week containing the first day of the next month
    const nextMonthDayOfWeek = firstDayOfNextMonth.getDay();
    const daysToSubtractNext = nextMonthDayOfWeek === 0 ? 6 : nextMonthDayOfWeek - 1;
    
    const firstMondayOfNextMonth = new Date(firstDayOfNextMonth);
    firstMondayOfNextMonth.setDate(firstDayOfNextMonth.getDate() - daysToSubtractNext);
    
    // If the first day of the next month is Sunday, the broadcast month
    // starts the previous Monday
    if (nextMonthDayOfWeek === 0) {
      firstMondayOfNextMonth.setDate(firstMondayOfNextMonth.getDate() - 7);
    }
    
    // Calculate broadcast month name (this is the name to display to the user)
    let broadcastMonthName;
    
    // Check if our date falls in the next broadcast month
    if (mondayOfCurrentWeek >= firstMondayOfNextMonth) {
      // We're in the next month's broadcast calendar
      broadcastMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(firstDayOfNextMonth);
      return {
        startOfBroadcastMonth: firstMondayOfNextMonth,
        endOfBroadcastMonth: new Date(new Date(nextMonthYear, nextMonthMonth + 1, 1).setDate(0)), // Last day of next month
        broadcastMonthName
      };
    } else {
      // We're in the current month's broadcast calendar
      broadcastMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
      return {
        startOfBroadcastMonth: firstMondayOfCurrentMonth,
        endOfBroadcastMonth: new Date(firstMondayOfNextMonth.getTime() - 1), // 1ms before next month
        broadcastMonthName
      };
    }
  };
  
  /**
   * Gets broadcast week information for a given date
   */
  export const getBroadcastWeek = (date) => {
    const d = new Date(date);
    
    // Find the Monday of the current week (broadcast weeks start on Monday)
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const mondayOfWeek = new Date(d);
    mondayOfWeek.setDate(d.getDate() - daysToSubtract);
    mondayOfWeek.setHours(0, 0, 0, 0);
    
    // Sunday of the week (end of broadcast week)
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    sundayOfWeek.setHours(23, 59, 59, 999);
    
    return {
      startOfBroadcastWeek: mondayOfWeek,
      endOfBroadcastWeek: sundayOfWeek
    };
  };
  
  /**
   * Gets broadcast quarter information for a given date
   */
  export const getBroadcastQuarter = (date) => {
    const d = new Date(date);
    const month = d.getMonth();
    let startMonth, endMonth;
    
    // Determine quarter based on month
    if (month <= 2) { // Q1: Jan, Feb, Mar
      startMonth = 0;
      endMonth = 3;
    } else if (month <= 5) { // Q2: Apr, May, Jun
      startMonth = 3;
      endMonth = 6;
    } else if (month <= 8) { // Q3: Jul, Aug, Sep
      startMonth = 6;
      endMonth = 9;
    } else { // Q4: Oct, Nov, Dec
      startMonth = 9;
      endMonth = 0; // Next year January
    }
    
    // Get start of the first broadcast month in the quarter
    const firstMonthOfQuarter = new Date(d.getFullYear(), startMonth, 1);
    const { startOfBroadcastMonth: startOfQuarter } = getBroadcastMonth(firstMonthOfQuarter);
    
    // Get end of the last broadcast month in the quarter
    let lastMonthOfQuarter;
    if (endMonth === 0) {
      lastMonthOfQuarter = new Date(d.getFullYear() + 1, endMonth, 1);
    } else {
      lastMonthOfQuarter = new Date(d.getFullYear(), endMonth, 1);
    }
    
    const { startOfBroadcastMonth: startOfNextQuarter } = getBroadcastMonth(lastMonthOfQuarter);
    
    // End of broadcast quarter is 5:59:59.999am on the first day of the next quarter
    const endOfQuarter = new Date(startOfNextQuarter);
    endOfQuarter.setHours(5, 59, 59, 999);
    
    return {
      startOfBroadcastQuarter: startOfQuarter,
      endOfBroadcastQuarter: endOfQuarter
    };
  };
  
  /**
   * Get comprehensive broadcast date info for a given date
   */
  export const getBroadcastDateInfo = (dateTime) => {
    const d = adjustForBroadcastDay(dateTime);
    const broadcastMonth = getBroadcastMonth(d);
    const broadcastWeek = getBroadcastWeek(d);
    const broadcastQuarter = getBroadcastQuarter(d);
    
    return {
      adjustedDate: d,
      broadcastDay: d.getDate(),
      broadcastMonth: broadcastMonth.broadcastMonthName,
      broadcastMonthStart: broadcastMonth.startOfBroadcastMonth,
      broadcastMonthEnd: broadcastMonth.endOfBroadcastMonth,
      broadcastWeekStart: broadcastWeek.startOfBroadcastWeek,
      broadcastWeekEnd: broadcastWeek.endOfBroadcastWeek,
      broadcastQuarterStart: broadcastQuarter.startOfBroadcastQuarter,
      broadcastQuarterEnd: broadcastQuarter.endOfBroadcastQuarter
    };
  };