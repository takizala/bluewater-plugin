import React from 'react';
import { getTimeOptions } from '../../utils/dateTimeUtils';

/**
 * Form for "Before" and "After" date selection options
 */
const BeforeAfterForm = ({ date1, setDate1, time1, setTime1, broadcastInfo }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Select Cutoff Date & Time:</h3>
      <div className="mb-4">
        <label className="block mb-1">Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date1.toISOString().split('T')[0]}
          onChange={(e) => setDate1(new Date(e.target.value))}
        />
        {broadcastInfo.date1Info && (
          <div className="mt-1 text-sm text-gray-600">
            Broadcast Month: {broadcastInfo.date1Info.broadcastMonth}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1">Time:</label>
        <select
          className="w-full p-2 border rounded"
          value={time1}
          onChange={(e) => setTime1(e.target.value)}
        >
          {getTimeOptions().map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BeforeAfterForm;