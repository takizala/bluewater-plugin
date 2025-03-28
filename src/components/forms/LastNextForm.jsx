import React from 'react';

/**
 * Form for "Last" and "Next" date range selection options
 */
const LastNextForm = ({ 
  unitCount, 
  setUnitCount, 
  selectedUnit, 
  setSelectedUnit, 
  includeCurrent, 
  setIncludeCurrent 
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Count:</label>
          <input
            type="number"
            min="1"
            className="w-full p-2 border rounded"
            value={unitCount}
            onChange={(e) => setUnitCount(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        
        <div>
          <label className="block mb-1">Unit:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="quarters">Quarters</option>
            <option value="years">Years</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={includeCurrent}
              onChange={(e) => setIncludeCurrent(e.target.checked)}
            />
            Include Current {selectedUnit.slice(0, -1).charAt(0).toUpperCase() + selectedUnit.slice(0, -1).slice(1)}
          </label>
        </div>
      </div>
    </div>
  );
};

export default LastNextForm;