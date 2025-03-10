
import React, { useMemo } from "react";
import {
  client,
  useConfig,
  useElementData,
  useElementColumns,
} from "@sigmacomputing/plugin";
import * as XLSX from "xlsx"; // Ensure SheetJS is installed.
import "./App.css";

// Configure your plugin’s editor panel.
client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "pivotRows", type: "column", source: "source", allowMultiple: true },
  { name: "measures", type: "column", source: "source", allowMultiple: true },
]);

// Helper to format a timestamp (if needed) into mm/dd/yyyy.
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Helper to clean column names: keep only the part after the first "/" if it exists.
function cleanColumnName(colName) {
  if (!colName) return "";
  const idx = colName.indexOf("/");
  return idx !== -1 ? colName.substring(idx + 1) : colName;
}

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  console.log('Config ', config)
  const pivotRows = config.pivotRows || [];
  const measures = config.measures || [];
  
  // Check if any data is loaded.
  const dataLoaded = Object.values(sigmaData).some(
    (col) => Array.isArray(col) && col.length > 0
  );

  // 1) GROUP the data by the unique combination of pivot row values,
  //    summing the measure values.
  const groupedData = useMemo(() => {
    if (!dataLoaded || pivotRows.length === 0 || measures.length === 0)
      return {};
    const grouped = {};
    const n = sigmaData[pivotRows[0]].length;
    for (let i = 0; i < n; i++) {
      const pivotValues = pivotRows.map((colId) => {
        let val = sigmaData[colId][i];
        if (elementColumns[colId]?.columnType === "datetime") {
          val = formatDate(val);
        }
        return val;
      });
      const key = pivotValues.join(" | ");
      if (!grouped[key]) {
        grouped[key] = { pivotValues, measures: {} };
        measures.forEach((m) => {
          grouped[key].measures[m] = 0;
        });
      }
      measures.forEach((m) => {
        grouped[key].measures[m] += sigmaData[m][i];
      });
    }
    return grouped;
  }, [sigmaData, pivotRows, measures, dataLoaded, elementColumns]);

  // 2) BUILD an array of table rows from groupedData.
  // Each row is: [pivotValue1, pivotValue2, ..., sumMeasure1, sumMeasure2, ...]
  const tableRows = useMemo(() => {
    const rows = [];
    Object.keys(groupedData).forEach((key) => {
      const group = groupedData[key];
      const row = [...group.pivotValues];
      measures.forEach((m) => row.push(group.measures[m]));
      rows.push(row);
    });
    // Sort rows by ALL pivot rows (oldest to newest for datetime)
    rows.sort((a, b) => {
      for (let i = 0; i < pivotRows.length; i++) {
        const colId = pivotRows[i];
        if (elementColumns[colId]?.columnType === "datetime") {
          const diff = new Date(a[i]) - new Date(b[i]);
          if (diff !== 0) return diff;
        } else {
          const cmp = String(a[i]).localeCompare(String(b[i]));
          if (cmp !== 0) return cmp;
        }
      }
      return 0;
    });
    return rows;
  }, [groupedData, measures, pivotRows, elementColumns]);

  // 3) ADD SUBTOTAL ROWS for each group of the FIRST pivot row, plus a GRAND TOTAL row.
  const rowsWithTotals = useMemo(() => {
    if (tableRows.length === 0) return [];
    let result = [];
    let currentPivotVal = tableRows[0][0];
    let measureAcc = Array(measures.length).fill(0);
    let grandAcc = Array(measures.length).fill(0);
    function pushSubtotalRow(pivotVal, measureValues) {
      const subtotalRow = Array(pivotRows.length + measures.length).fill("");
      subtotalRow[0] = `Total for ${pivotVal}`;
      measureValues.forEach((val, idx) => {
        subtotalRow[pivotRows.length + idx] = val;
      });
      result.push(subtotalRow);
    }
    for (let i = 0; i < tableRows.length; i++) {
      const row = [...tableRows[i]];
      const pivotVal = row[0];
      if (pivotVal !== currentPivotVal) {
        pushSubtotalRow(currentPivotVal, measureAcc);
        measureAcc = Array(measures.length).fill(0);
        currentPivotVal = pivotVal;
      }
      result.push(row);
      for (let mIdx = 0; mIdx < measures.length; mIdx++) {
        const measureVal = row[pivotRows.length + mIdx];
        measureAcc[mIdx] += measureVal;
        grandAcc[mIdx] += measureVal;
      }
    }
    pushSubtotalRow(currentPivotVal, measureAcc);
    const grandRow = Array(pivotRows.length + measures.length).fill("");
    grandRow[0] = "Grand Total";
    grandAcc.forEach((val, idx) => {
      grandRow[pivotRows.length + idx] = val;
    });
    result.push(grandRow);
    return result;
  }, [tableRows, pivotRows, measures]);

  // 4) BUILD tableWithRowSpan for computing merge ranges.
  const tableWithRowSpan = useMemo(() => {
    const merged = [];
    let prev = null;
    let rowspan = 1;
    rowsWithTotals.forEach((row) => {
      if (
        typeof row[0] === "string" &&
        (row[0].startsWith("Total for") || row[0].startsWith("Grand Total"))
      ) {
        if (prev) {
          merged.push({ row: prev, rowspan });
          prev = null;
          rowspan = 1;
        }
        merged.push({ row, rowspan: 1 });
      } else {
        if (prev && prev[0] === row[0]) {
          rowspan++;
          row[0] = null;
        } else {
          if (prev) merged.push({ row: prev, rowspan });
          prev = row;
          rowspan = 1;
        }
      }
    });
    if (prev) merged.push({ row: prev, rowspan });
    return merged;
  }, [rowsWithTotals]);

  // 5) EXPORT TO EXCEL with column headers using actual column names from useElementColumns.
  const handleExportExcel = () => {
    // Build export header using actual column names from elementColumns.
    console.log(" pivotRows ", pivotRows);
    
    const headerRow = [
      ...pivotRows.map((col) =>
        elementColumns[col] && elementColumns[col].name
          ? elementColumns[col].name
          : col
      ),
      ...measures.map((col) =>
        elementColumns[col] && elementColumns[col].name
          ? elementColumns[col].name
          : col
      ),
    ];
    const exportData = [headerRow, ...rowsWithTotals];
    
    // Compute merge ranges for the first column in exportData.
    const merges = [];
    let start = null;
    for (let i = 1; i < exportData.length; i++) {
      if (!exportData[i]) continue;
      const rowVal = exportData[i][0];
      if (
        typeof rowVal === "string" &&
        (rowVal.startsWith("Total for") || rowVal.startsWith("Grand Total"))
      ) {
        if (start !== null && i - start > 1) {
          merges.push({ s: { r: start, c: 0 }, e: { r: i - 1, c: 0 } });
        }
        start = null;
        continue;
      }
      if (start === null) {
        start = i;
      }
      if (
        i === exportData.length - 1 ||
        !exportData[i + 1] ||
        exportData[i + 1][0] !== rowVal ||
        (typeof exportData[i + 1][0] === "string" &&
          (exportData[i + 1][0].startsWith("Total for") ||
           exportData[i + 1][0].startsWith("Grand Total")))
      ) {
        const end = i;
        if (end - start >= 1) {
          merges.push({ s: { r: start, c: 0 }, e: { r: end, c: 0 } });
        }
        start = null;
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    ws["!merges"] = merges;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "export.xlsx");
  };

  return (
    <div style={{ position: "absolute", top: "0", left: "0" }}>
      <button onClick={handleExportExcel}>Export Data as Excel</button>
    </div>
  );
}

export default App;
