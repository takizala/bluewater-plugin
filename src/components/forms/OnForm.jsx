import React from 'react';
import { formatDateTime } from '../../utils/dateTimeUtils';

/**
 * Form for "On" date selection option (selecting a specific broadcast day)
 */
const OnForm = ({ date1, setDate1, broadcastInfo }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Select Broadcast Day:</h3>
      <div className="mb-4">
        <label className="block mb-1">Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date1.toISOString().split('T')[0]}
          onChange={(e) => setDate1(new Date(e.target.value))}
        />
        {broadcastInfo.date1Info && (
          <div className="mt-2 text-sm">
            <div><strong>Broadcast Day:</strong> {formatDateTime(broadcastInfo.date1Info.adjustedDate).split(',')[0]}</div>
            <div><strong>Broadcast Week:</strong> {formatDateTime(broadcastInfo.date1Info.broadcastWeekStart).split(',')[0]} to {formatDateTime(broadcastInfo.date1Info.broadcastWeekEnd).split(',')[0]}</div>
            <div><strong>Broadcast Month:</strong> {broadcastInfo.date1Info.broadcastMonth}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnForm;