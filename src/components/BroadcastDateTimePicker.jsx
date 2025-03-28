import React, { useState, useEffect } from 'react';

// Import form components
import BetweenForm from './forms/BetweenForm';
import OnForm from './forms/OnForm';
import BeforeAfterForm from './forms/BeforeAfterForm';
import LastNextForm from './forms/LastNextForm';
import CurrentForm from './forms/CurrentForm';

// Import display components
import DateTimeRangeDisplay from './display/DateTimeRangeDisplay';
import BroadcastInfoDisplay from './display/BroadcastInfoDisplay';

// Import utility functions
import { combineDateTime } from '../utils/dateTimeUtils';
import { getBroadcastDateInfo, adjustForBroadcastDay, getBroadcastWeek, getBroadcastMonth, getBroadcastQuarter } from '../utils/broadcastCalendar';
import { getDateTimeRanges } from '../utils/dateRangeCalculator';

/**
 * Main Broadcast Calendar Date-Time Picker component
 */
const BroadcastDateTimePicker = () => {
  // State for the selected option
  const [selectedOption, setSelectedOption] = useState('between');
  
  // State for date pickers
  const [date1, setDate1] = useState(new Date());
  const [time1, setTime1] = useState('06:00');
  const [date2, setDate2] = useState(new Date());
  const [time2, setTime2] = useState('05:59');
  
  // State for Last/Next options
  const [unitCount, setUnitCount] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('days');
  const [includeCurrent, setIncludeCurrent] = useState(true);
  
  // State for the calculated date range
  const [dateTimeRange, setDateTimeRange] = useState({
    startDateTime: null,
    endDateTime: null
  });
  
  // State for the broadcast calendar information
  const [broadcastInfo, setBroadcastInfo] = useState({
    date1Info: null,
    date2Info: null
  });
  
  // Helper functions to pass to utility functions
  const broadcastHelpers = {
    adjustForBroadcastDay,
    getBroadcastWeek,
    getBroadcastMonth,
    getBroadcastQuarter
  };
  
  // Update broadcast info when dates change
  useEffect(() => {
    const datetime1 = combineDateTime(date1, time1);
    const datetime2 = combineDateTime(date2, time2);
    
    setBroadcastInfo({
      date1Info: getBroadcastDateInfo(datetime1),
      date2Info: getBroadcastDateInfo(datetime2)
    });
    
    // Calculate date range based on the selected option
    calculateDateRange();
  }, [date1, time1, date2, time2, selectedOption, unitCount, selectedUnit, includeCurrent]);
  
  // Calculate the date range based on the selected option
  const calculateDateRange = () => {
    const datetime1 = combineDateTime(date1, time1);
    const datetime2 = combineDateTime(date2, time2);
    
    const range = getDateTimeRanges(
      selectedOption,
      datetime1,
      datetime2,
      selectedUnit,
      unitCount,
      includeCurrent,
      broadcastHelpers
    );
    
    setDateTimeRange(range);
  };
  
  // Render the appropriate form based on the selected option
  const renderForm = () => {
    switch (selectedOption) {
      case 'between':
        return (
          <BetweenForm
            date1={date1}
            setDate1={setDate1}
            time1={time1}
            setTime1={setTime1}
            date2={date2}
            setDate2={setDate2}
            time2={time2}
            setTime2={setTime2}
            broadcastInfo={broadcastInfo}
          />
        );
      case 'on':
        return (
          <OnForm
            date1={date1}
            setDate1={setDate1}
            broadcastInfo={broadcastInfo}
          />
        );
      case 'before':
      case 'after':
        return (
          <BeforeAfterForm
            date1={date1}
            setDate1={setDate1}
            time1={time1}
            setTime1={setTime1}
            broadcastInfo={broadcastInfo}
          />
        );
      case 'last':
      case 'next':
        return (
          <LastNextForm
            unitCount={unitCount}
            setUnitCount={setUnitCount}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            includeCurrent={includeCurrent}
            setIncludeCurrent={setIncludeCurrent}
          />
        );
      case 'current':
        return (
          <CurrentForm
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Broadcast Calendar Date-Time Picker</h2>
      
      {/* Option selector */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Range Type:</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="between">Between</option>
          <option value="on">On</option>
          <option value="before">Before</option>
          <option value="after">After</option>
          <option value="last">Last</option>
          <option value="next">Next</option>
          <option value="current">Current</option>
        </select>
      </div>
      
      {/* Form based on selected option */}
      {renderForm()}
      
      {/* Results display */}
      <DateTimeRangeDisplay dateTimeRange={dateTimeRange} />
      
      {/* Broadcast calendar info */}
      <BroadcastInfoDisplay 
        broadcastInfo={broadcastInfo} 
        selectedOption={selectedOption} 
      />
    </div>
  );
};

export default BroadcastDateTimePicker;