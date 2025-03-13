import React, { useState, useEffect } from "react";
import {
  client,
  useConfig,
  useElementData,
  useElementColumns,
} from "@sigmacomputing/plugin";
import "./App.css";

const getCurrentDateTime = () => {
  const now = new Date();
  
  const dateString = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  const timeString = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/:/g, '-');
  
  return `${dateString}_${timeString}`;
};



client.config.configureEditorPanel([
  {
     name: "source",
     type: "element"
   },
  {
     name: "pivotRows",
     type: "column",
     source: "source",
     allowMultiple: true,
     allowedTypes: ["text","string", "datetime"]
  },
  {
     name: "measures",
     type: "column",
     source: "source",
     allowMultiple: true,
     allowedTypes: ["number"]
  },
  {
    name: "File-Title",
    type: "text",
    defaultValue: "Report",
  },
  {
    name: "File-Name",
    type: "text",
    defaultValue: `Export_${getCurrentDateTime()}`,
  }
]);

const AGGREGATION_OPTIONS = ["SUM", "AVG", "MAX", "MIN"];

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  const pivotRows = config.pivotRows || [];
  const measures = config.measures || [];
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultSelection = () =>
    pivotRows.reduce(
      (acc, col, index) => ({ ...acc, [col]: index !== pivotRows.length - 1 }),
      {}
    );

  const [coloredItemsMap, setColoredItemsMap] = useState(getDefaultSelection);
  const [measureAggregations, setMeasureAggregations] = useState(
    measures.reduce((acc, col) => ({ ...acc, [col]: "SUM" }), {})
  );
  useEffect(() => {
    setColoredItemsMap(getDefaultSelection());
  }, [pivotRows]);

  useEffect(() => {
    setMeasureAggregations(
      measures.reduce(
        (acc, col) => ({ ...acc, [col]: measureAggregations[col] || "SUM" }),
        {}
      )
    );
  }, [measures]);

  const isExportDisabled = pivotRows.length === 0 || measures.length === 0 || isLoading;

  const handleCheckboxChange = (col) => {
    setColoredItemsMap((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleAggregationChange = (col, value) => {
    setMeasureAggregations((prev) => ({ ...prev, [col]: value }));
  };

  const handleSendData = async () => {
    setIsLoading(true);
    
    try {
      const fileName = config["File-Name"];

      const payload = {
        pivotRows: pivotRows.map((col, index) => ({
          id: col,
          name: elementColumns[col]?.name || col,
          type: elementColumns[col]?.columnType || "unknown",
          order: index,
          coloredItems: coloredItemsMap[col] || false,
        })),
        measures: measures.map((col, index) => ({
          id: col,
          name: elementColumns[col]?.name || col,
          type: elementColumns[col]?.columnType || "unknown",
          order: index,
          aggregation: measureAggregations[col] || "SUM",
        })),
        settings:{
          title: config["File-Title"],
          fileName: fileName,
        },
        data: Object.keys(sigmaData[pivotRows[0]] || []).map((_, rowIndex) => {
          let row = {};
          [...pivotRows, ...measures].forEach((col) => {
            let value = sigmaData[col][rowIndex];
            if (elementColumns[col]?.columnType === "datetime") {
              value = new Date(value).toISOString().split("T")[0];
            }
            row[col] = value;
          });
          return row;
        }),
      };
      
      const response = await fetch("http://localhost:8005/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        console.error("Failed to download file:", response.statusText);
        return;
      }
    
      // Convert response to a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
    
      // Create a temporary <a> element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
    
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during export:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Data Export Configuration</h3>
      <div style={styles.configContainer}>
        {/* Pivot Rows Section */}
        <div style={{ ...styles.configBox, flexGrow: 1 }}>
          <h4 style={styles.subheading}>Pivot Rows</h4>
          <p style={styles.description}>Select which pivot rows to highlight.</p>
          <div style={styles.checkboxContainer}>
            {pivotRows.length > 0 ? (
              pivotRows.map((col) => (
                <label key={col} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={coloredItemsMap[col] || false}
                    onChange={() => handleCheckboxChange(col)}
                    style={styles.checkbox}
                  />
                  <span style={styles.noWrap}>{elementColumns[col]?.name || col}</span>
                </label>
              ))
            ) : (
              <p style={styles.emptyMessage}>Please select pivot rows in the configuration panel</p>
            )}
          </div>
        </div>
        {/* Measures Section */}
        <div style={{ ...styles.configBox, flexGrow: 1 }}>
          <h4 style={styles.subheading}>Measures</h4>
          <p style={styles.description}>Select aggregation type for measures.</p>
          <div style={styles.measureContainer}>
            {measures.length > 0 ? (
              measures.map((col) => (
                <div key={col} style={styles.measureRow}>
                  <span style={styles.noWrap}>{elementColumns[col]?.name || col}</span>
                  <select
                    value={measureAggregations[col]}
                    onChange={(e) => handleAggregationChange(col, e.target.value)}
                    style={styles.dropdown}
                  >
                    {AGGREGATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            ) : (
              <p style={styles.emptyMessage}>Please select measures in the configuration panel</p>
            )}
          </div>
        </div>
      </div>
      {/* Export Button with Loading State */}
      <button 
        onClick={handleSendData} 
        style={{
          ...styles.button,
          ...(isExportDisabled ? styles.buttonDisabled : {}),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}
        disabled={isExportDisabled}
      >
        {isLoading ? (
          <>
            <div style={styles.spinner}></div>
            <span>Exporting...</span>
          </>
        ) : (
          "Export Data as Excel"
        )}
      </button>
      
      {!isLoading && (pivotRows.length === 0 || measures.length === 0) && (
        <p style={styles.helperText}>
          {pivotRows.length === 0 && measures.length === 0 
            ? "Please select both pivot rows and measures to enable export" 
            : pivotRows.length === 0 
              ? "Please select pivot rows to enable export" 
              : "Please select measures to enable export"}
        </p>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "25px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    width: "fit-content",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  configContainer: {
    display: "flex",
    gap: "20px",
    width: "100%",
  },
  configBox: {
    padding: "15px",
    borderRadius: "10px",
    background: "#f9f9f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    minWidth: "250px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: "10px",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
  },
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    color: "#333",
    cursor: "pointer",
  },
  noWrap: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  checkbox: {
    marginRight: "10px",
    cursor: "pointer",
  },
  measureContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  measureRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    color: "#333",
    whiteSpace: "nowrap",
  },
  dropdown: {
    padding: "8px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "25px",
    padding: "12px 18px",
    fontSize: "18px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.2s",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTop: "3px solid white",
    animation: "spin 1s linear infinite",
  },
  emptyMessage: {
    fontSize: "14px",
    color: "#888",
    fontStyle: "italic",
  },
  helperText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#d9534f",
    textAlign: "center",
  },
};



export default App;