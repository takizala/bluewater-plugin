import React from 'react';
import { formatDateTime } from '../../utils/dateTimeUtils';

/**
 * Component to display the calculated date-time range
 */
const DateTimeRangeDisplay = ({ dateTimeRange }) => {
  const { startDateTime, endDateTime } = dateTimeRange;
  
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Calculated Date-Time Range:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Start:</p>
          <p>{formatDateTime(startDateTime)}</p>
        </div>
        
        <div>
          <p className="font-medium">End:</p>
          <p>{formatDateTime(endDateTime)}</p>
        </div>
      </div>
    </div>
  );
};

export default DateTimeRangeDisplay;