

import React, { useState } from 'react';
import { useVariable, useEditorPanelConfig, SigmaClientProvider, usePlugin, useConfig, client } from '@sigmacomputing/plugin';

const DatePickerPlugin = () => {

  const config = useConfig();
  // Configure the editor panel with a variable for the date range
  useEditorPanelConfig([
    {
      type: 'variable',
      name: 'dateRange',
      label: 'Date Range',
    },
  ]);
  
  
  // State for start and end dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use the `useVariable` hook to get and set the date range variable
  const [dateRangeVariable, setDateRangeVariable] = useVariable(config.dateRange);

  // Handler for applying the date range filter
  const handleApplyFilter = () => {
    if (startDate && endDate) {
      setDateRangeVariable(startDate, endDate);
    } else {
      console.error('Please select both start and end dates.');
    }
  };
  
  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Date Range Filter</h3>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="startDate">Start Date & Time:</label>
        <input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginLeft: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="endDate">End Date & Time:</label>
        <input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: '8px' }}
        />
      </div>
      <button
        onClick={handleApplyFilter}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Apply Filter
      </button>
    </div>
  );
}  

// Wrap the plugin with the SigmaClientProvider
const App = () => {
  const pluginInstance = usePlugin(); // Get the plugin instance
  return (
    <SigmaClientProvider client={pluginInstance}>
      <DatePickerPlugin />
    </SigmaClientProvider>
  );
};

export default App;