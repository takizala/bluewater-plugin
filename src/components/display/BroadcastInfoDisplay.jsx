import React from 'react';
import { formatDateTime, getWeekdayName } from '../../utils/dateTimeUtils';

/**
 * Component to display broadcast calendar information
 */
const BroadcastInfoDisplay = ({ broadcastInfo, selectedOption }) => {
  const { date1Info, date2Info } = broadcastInfo;
  
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Broadcast Calendar Information:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {date1Info && (
          <div>
            <h4 className="font-medium">Start Date Info:</h4>
            <ul className="mt-2 text-sm space-y-1">
              <li><strong>Weekday:</strong> {getWeekdayName(date1Info.adjustedDate)}</li>
              <li><strong>Broadcast Month:</strong> {date1Info.broadcastMonth}</li>
              <li><strong>Month Start:</strong> {formatDateTime(date1Info.broadcastMonthStart)}</li>
              <li><strong>Month End:</strong> {formatDateTime(date1Info.broadcastMonthEnd)}</li>
              <li><strong>Week Start:</strong> {formatDateTime(date1Info.broadcastWeekStart)}</li>
              <li><strong>Week End:</strong> {formatDateTime(date1Info.broadcastWeekEnd)}</li>
            </ul>
          </div>
        )}
        
        {selectedOption === 'between' && date2Info && (
          <div>
            <h4 className="font-medium">End Date Info:</h4>
            <ul className="mt-2 text-sm space-y-1">
              <li><strong>Weekday:</strong> {getWeekdayName(date2Info.adjustedDate)}</li>
              <li><strong>Broadcast Month:</strong> {date2Info.broadcastMonth}</li>
              <li><strong>Month Start:</strong> {formatDateTime(date2Info.broadcastMonthStart)}</li>
              <li><strong>Month End:</strong> {formatDateTime(date2Info.broadcastMonthEnd)}</li>
              <li><strong>Week Start:</strong> {formatDateTime(date2Info.broadcastWeekStart)}</li>
              <li><strong>Week End:</strong> {formatDateTime(date2Info.broadcastWeekEnd)}</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200 text-sm">
        <p><strong>Note:</strong> According to broadcast calendar rules:</p>
        <ul className="list-disc ml-5 mt-1">
          <li>Broadcast days run from 6:00 AM to 5:59 AM the next calendar day</li>
          <li>Broadcast weeks begin on Monday and end on Sunday</li>
          <li>The first week of a broadcast month is the week that contains the first day of the calendar month</li>
          <li>If the 1st of the month is a Sunday, the entire week is counted in that month</li>
        </ul>
      </div>
    </div>
  );
};

export default BroadcastInfoDisplay;