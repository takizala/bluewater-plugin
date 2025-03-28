import React from 'react';

/**
 * Form for "Current" date range selection option
 */
const CurrentForm = ({ selectedUnit, setSelectedUnit }) => {
  return (
    <div className="p-4 border rounded-lg">
      <div>
        <label className="block mb-1">Unit:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="minutes">Minute</option>
          <option value="hours">Hour</option>
          <option value="days">Day</option>
          <option value="weeks">Week</option>
          <option value="months">Month</option>
          <option value="quarters">Quarter</option>
          <option value="years">Year</option>
        </select>
      </div>
    </div>
  );
};

export default CurrentForm;