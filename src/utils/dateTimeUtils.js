/**
 * Utility functions for working with dates and times
 */

/**
 * Format date for display in a user-friendly format
 */
export const formatDateTime = (date) => {
    if (!date) return 'Not set';
    
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  };
  
  /**
   * Get the name of the weekday for a given date
   */
  export const getWeekdayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };
  
  /**
   * Generate time options for select dropdown (24-hour format)
   * Creates options at 15-minute intervals
   */
  export const getTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        options.push(`${h}:${m}`);
      }
    }
    return options;
  };
  
  /**
   * Combine a date object and time string into a single Date object
   */
  export const combineDateTime = (date, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
  };
  
  /**
   * Calculate the current unit range (minute, hour, day, week, month, quarter, year)
   */
  export const calculateCurrentUnitRange = (date, unit, { adjustForBroadcastDay, getBroadcastWeek, getBroadcastMonth, getBroadcastQuarter }) => {
    const d = new Date(date);
    let start, end;
    
    switch (unit) {
      case 'minutes':
        start = new Date(d);
        start.setSeconds(0, 0);
        end = new Date(start);
        end.setMinutes(end.getMinutes() + 1);
        end.setMilliseconds(end.getMilliseconds() - 1);
        break;
        
      case 'hours':
        start = new Date(d);
        start.setMinutes(0, 0, 0);
        end = new Date(start);
        end.setHours(end.getHours() + 1);
        end.setMilliseconds(end.getMilliseconds() - 1);
        break;
        
      case 'days':
        // For broadcast days, a day starts at 6am
        start = new Date(d);
        start.setHours(6, 0, 0, 0);
        if (d.getHours() < 6) {
          // If current time is before 6am, we're in the previous broadcast day
          start.setDate(start.getDate() - 1);
        }
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        end.setHours(5, 59, 59, 999); // End at 5:59:59.999am the next day
        break;
        
      case 'weeks':
        const weekRange = getBroadcastWeek(d);
        start = weekRange.startOfBroadcastWeek;
        end = weekRange.endOfBroadcastWeek;
        break;
        
      case 'months':
        const monthRange = getBroadcastMonth(d);
        start = monthRange.startOfBroadcastMonth;
        end = monthRange.endOfBroadcastMonth;
        break;
        
      case 'quarters':
        const quarterRange = getBroadcastQuarter(d);
        start = quarterRange.startOfBroadcastQuarter;
        end = quarterRange.endOfBroadcastQuarter;
        break;
        
      case 'years':
        // Find the first broadcast day of the year
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const firstBroadcastMonth = getBroadcastMonth(firstDayOfYear);
        start = firstBroadcastMonth.startOfBroadcastMonth;
        
        // Find the last broadcast day of the year
        const lastDayOfYear = new Date(d.getFullYear(), 11, 31);
        // Find the first day of next year's first broadcast month
        const nextYearFirstDay = new Date(d.getFullYear() + 1, 0, 1);
        const nextYearFirstBroadcastMonth = getBroadcastMonth(nextYearFirstDay);
        
        // End of broadcast year is 5:59:59.999am on the first day of next year's first broadcast month
        end = new Date(nextYearFirstBroadcastMonth.startOfBroadcastMonth);
        end.setHours(5, 59, 59, 999);
        break;
        
      default:
        start = d;
        end = d;
    }
    
    return { start, end };
  };