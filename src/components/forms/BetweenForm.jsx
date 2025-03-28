import React from 'react';
import { getTimeOptions } from '../../utils/dateTimeUtils';

/**
 * Form for "Between" date selection option
 */
const BetweenForm = ({ 
  date1, 
  setDate1, 
  time1, 
  setTime1, 
  date2, 
  setDate2, 
  time2, 
  setTime2, 
  broadcastInfo 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Start Date & Time:</h3>
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
              <option key={`t1-${time}`} value={time}>{time}</option>
            ))}
          </select>
          <div className="mt-1 text-sm text-gray-600">
            Note: Broadcast day starts at 6:00 AM
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">End Date & Time:</h3>
        <div className="mb-4">
          <label className="block mb-1">Date:</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={date2.toISOString().split('T')[0]}
            onChange={(e) => setDate2(new Date(e.target.value))}
          />
          {broadcastInfo.date2Info && (
            <div className="mt-1 text-sm text-gray-600">
              Broadcast Month: {broadcastInfo.date2Info.broadcastMonth}
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1">Time:</label>
          <select
            className="w-full p-2 border rounded"
            value={time2}
            onChange={(e) => setTime2(e.target.value)}
          >
            {getTimeOptions().map(time => (
              <option key={`t2-${time}`} value={time}>{time}</option>
            ))}
          </select>
          <div className="mt-1 text-sm text-gray-600">
            Note: Broadcast day ends at 5:59 AM
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetweenForm;