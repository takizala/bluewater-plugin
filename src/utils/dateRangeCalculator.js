/**
 * Functions for calculating date ranges based on different criteria
 */
import { calculateCurrentUnitRange } from './dateTimeUtils';

/**
 * Calculates a unit range (e.g., last 7 days, next 3 months)
 * 
 * @param {Date} date Base date
 * @param {string} unit Time unit ('minutes', 'hours', 'days', 'weeks', 'months', 'quarters', 'years')
 * @param {number} count Number of units
 * @param {boolean} isPast Whether to calculate in the past (true) or future (false)
 * @param {boolean} includeCurrent Whether to include the current unit in the calculation
 * @param {Object} helpers Broadcast calendar helpers
 * @returns {Object} Object with start and end dates
 */
export const calculateUnitRange = (date, unit, count, isPast, includeCurrent, helpers) => {
  const { getBroadcastMonth, getBroadcastQuarter } = helpers;
  const d = new Date(date);
  let start, end;
  
  // If count is 1 and includeCurrent is true, fall back to current unit
  if (count === 1 && includeCurrent) {
    return calculateCurrentUnitRange(d, unit, helpers);
  }
  
  // Function to get current unit's range
  const getCurrentRange = () => {
    return calculateCurrentUnitRange(d, unit, helpers);
  };
  
  // Calculate range based on unit and count
  if (includeCurrent) {
    // Include the current unit in the calculation
    const currentRange = getCurrentRange();
    
    if (isPast) {
      // For past with includeCurrent: end is the end of current unit, start is 'count' units back
      end = currentRange.end;
      start = new Date(currentRange.start);
      
      // Subtract 'count' units from the start
      switch (unit) {
        case 'minutes':
          start.setMinutes(start.getMinutes() - count);
          break;
        case 'hours':
          start.setHours(start.getHours() - count);
          break;
        case 'days':
          start.setDate(start.getDate() - count);
          break;
        case 'weeks':
          start.setDate(start.getDate() - count * 7);
          break;
        case 'months': {
          // We need to find the broadcast month 'count' months ago
          let targetMonth = start.getMonth() - count;
          let targetYear = start.getFullYear();
          while (targetMonth < 0) {
            targetYear--;
            targetMonth += 12;
          }
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { startOfBroadcastMonth } = getBroadcastMonth(targetDate);
          start = startOfBroadcastMonth;
          break;
        }
        case 'quarters': {
          // Find the broadcast quarter 'count' quarters ago
          let targetQuarter = Math.floor(start.getMonth() / 3) - count;
          let targetYear = start.getFullYear();
          while (targetQuarter < 0) {
            targetYear--;
            targetQuarter += 4;
          }
          const targetMonth = targetQuarter * 3;
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { startOfBroadcastQuarter } = getBroadcastQuarter(targetDate);
          start = startOfBroadcastQuarter;
          break;
        }
        case 'years':
          // Find the broadcast year 'count' years ago
          const targetYear = start.getFullYear() - count;
          const targetDate = new Date(targetYear, 0, 1);
          const { startOfBroadcastMonth } = getBroadcastMonth(targetDate);
          start = startOfBroadcastMonth;
          break;
      }
    } else {
      // For future with includeCurrent: start is the start of current unit, end is 'count' units ahead
      start = currentRange.start;
      end = new Date(currentRange.end);
      
      // Add 'count' units to the end
      switch (unit) {
        case 'minutes':
          end.setMinutes(end.getMinutes() + count);
          break;
        case 'hours':
          end.setHours(end.getHours() + count);
          break;
        case 'days':
          end.setDate(end.getDate() + count);
          break;
        case 'weeks':
          end.setDate(end.getDate() + count * 7);
          break;
        case 'months': {
          // We need to find the broadcast month 'count' months ahead
          let targetMonth = end.getMonth() + count;
          let targetYear = end.getFullYear();
          while (targetMonth > 11) {
            targetYear++;
            targetMonth -= 12;
          }
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { endOfBroadcastMonth } = getBroadcastMonth(targetDate);
          end = endOfBroadcastMonth;
          break;
        }
        case 'quarters': {
          // Find the broadcast quarter 'count' quarters ahead
          let targetQuarter = Math.floor(end.getMonth() / 3) + count;
          let targetYear = end.getFullYear();
          while (targetQuarter > 3) {
            targetYear++;
            targetQuarter -= 4;
          }
          const targetMonth = targetQuarter * 3;
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { endOfBroadcastQuarter } = getBroadcastQuarter(targetDate);
          end = endOfBroadcastQuarter;
          break;
        }
        case 'years':
          // Find the broadcast year 'count' years ahead
          const targetYear = end.getFullYear() + count;
          const targetDate = new Date(targetYear, 11, 31);
          end = targetDate;
          end.setHours(23, 59, 59, 999);
          break;
      }
    }
  } else {
    // Don't include the current unit
    if (isPast) {
      // For past without includeCurrent: end is start of current unit, start is 'count' units back
      const currentRange = getCurrentRange();
      end = new Date(currentRange.start);
      end.setMilliseconds(end.getMilliseconds() - 1); // Just before current unit starts
      
      // Calculate the start based on the unit and count
      start = new Date(end);
      
      switch (unit) {
        case 'minutes':
          start.setMinutes(start.getMinutes() - count);
          break;
        case 'hours':
          start.setHours(start.getHours() - count);
          break;
        case 'days':
          start.setDate(start.getDate() - count);
          break;
        case 'weeks':
          start.setDate(start.getDate() - count * 7);
          break;
        case 'months': {
          let targetMonth = start.getMonth() - count;
          let targetYear = start.getFullYear();
          while (targetMonth < 0) {
            targetYear--;
            targetMonth += 12;
          }
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { startOfBroadcastMonth } = getBroadcastMonth(targetDate);
          start = startOfBroadcastMonth;
          break;
        }
        case 'quarters': {
          let targetQuarter = Math.floor(start.getMonth() / 3) - count;
          let targetYear = start.getFullYear();
          while (targetQuarter < 0) {
            targetYear--;
            targetQuarter += 4;
          }
          const targetMonth = targetQuarter * 3;
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { startOfBroadcastQuarter } = getBroadcastQuarter(targetDate);
          start = startOfBroadcastQuarter;
          break;
        }
        case 'years':
          const targetYear = start.getFullYear() - count;
          const targetDate = new Date(targetYear, 0, 1);
          const { startOfBroadcastMonth } = getBroadcastMonth(targetDate);
          start = startOfBroadcastMonth;
          break;
      }
    } else {
      // For future without includeCurrent: start is end of current unit, end is 'count' units ahead
      const currentRange = getCurrentRange();
      start = new Date(currentRange.end);
      start.setMilliseconds(start.getMilliseconds() + 1); // Just after current unit ends
      
      // Calculate the end based on the unit and count
      end = new Date(start);
      
      switch (unit) {
        case 'minutes':
          end.setMinutes(end.getMinutes() + count);
          break;
        case 'hours':
          end.setHours(end.getHours() + count);
          break;
        case 'days':
          end.setDate(end.getDate() + count);
          break;
        case 'weeks':
          end.setDate(end.getDate() + count * 7);
          break;
        case 'months': {
          let targetMonth = end.getMonth() + count;
          let targetYear = end.getFullYear();
          while (targetMonth > 11) {
            targetYear++;
            targetMonth -= 12;
          }
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { endOfBroadcastMonth } = getBroadcastMonth(targetDate);
          end = endOfBroadcastMonth;
          break;
        }
        case 'quarters': {
          let targetQuarter = Math.floor(end.getMonth() / 3) + count;
          let targetYear = end.getFullYear();
          while (targetQuarter > 3) {
            targetYear++;
            targetQuarter -= 4;
          }
          const targetMonth = targetQuarter * 3;
          const targetDate = new Date(targetYear, targetMonth, 1);
          const { endOfBroadcastQuarter } = getBroadcastQuarter(targetDate);
          end = endOfBroadcastQuarter;
          break;
        }
        case 'years':
          const targetYear = end.getFullYear() + count;
          const targetDate = new Date(targetYear, 11, 31);
          end = targetDate;
          end.setHours(23, 59, 59, 999);
          break;
      }
    }
  }
  
  return { start, end };
};

/**
 * Get datetime ranges based on selected options
 * 
 * @param {string} option The type of range ('between', 'on', 'before', 'after', 'last', 'next', 'current')
 * @param {Date} dateTime1 First date
 * @param {Date} dateTime2 Second date (optional)
 * @param {string} unit Time unit for 'last', 'next', 'current' options
 * @param {number} count Count for 'last', 'next' options
 * @param {boolean} includeCurrent Whether to include current unit in calculation
 * @param {Object} helpers Broadcast calendar helper functions
 * @returns {Object} Object with startDateTime and endDateTime
 */
export const getDateTimeRanges = (option, dateTime1, dateTime2, unit, count, includeCurrent, helpers) => {
  const { adjustForBroadcastDay } = helpers;
  
  // Adjust both dates for broadcast day rules (6am start)
  const adjustedDateTime1 = adjustForBroadcastDay(dateTime1);
  const adjustedDateTime2 = dateTime2 ? adjustForBroadcastDay(dateTime2) : null;
  
  // Current date time with broadcast day adjustment
  const now = adjustForBroadcastDay(new Date());
  
  let startDateTime, endDateTime;
  
  switch (option) {
    case 'between':
      if (adjustedDateTime1 && adjustedDateTime2) {
        startDateTime = adjustedDateTime1 < adjustedDateTime2 ? adjustedDateTime1 : adjustedDateTime2;
        endDateTime = adjustedDateTime1 < adjustedDateTime2 ? adjustedDateTime2 : adjustedDateTime1;
      }
      break;
      
    case 'on':
      if (adjustedDateTime1) {
        // For "on", we set the range to be the entire broadcast day
        const broadcastDayStart = new Date(adjustedDateTime1);
        broadcastDayStart.setHours(6, 0, 0, 0);
        
        const broadcastDayEnd = new Date(adjustedDateTime1);
        broadcastDayEnd.setDate(broadcastDayEnd.getDate() + 1);
        broadcastDayEnd.setHours(5, 59, 59, 999);
        
        startDateTime = broadcastDayStart;
        endDateTime = broadcastDayEnd;
      }
      break;
      
    case 'before':
      if (adjustedDateTime1) {
        startDateTime = new Date(0); // Beginning of time
        endDateTime = adjustedDateTime1;
      }
      break;
      
    case 'after':
      if (adjustedDateTime1) {
        startDateTime = adjustedDateTime1;
        endDateTime = new Date(8640000000000000); // End of time 😂
      }
      break;
      
    case 'last':
    case 'next':
      if (count && unit) {
        const isPast = option === 'last';
        const result = calculateUnitRange(now, unit, count, isPast, includeCurrent, helpers);
        startDateTime = result.start;
        endDateTime = result.end;
      }
      break;
      
    case 'current':
      if (unit) {
        const result = calculateCurrentUnitRange(now, unit, helpers);
        startDateTime = result.start;
        endDateTime = result.end;
      }
      break;
  }
  
  return {
    startDateTime,
    endDateTime
  };
};