import React, { useState, useEffect, useRef } from "react";
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
  }).replace(/\//g, '.');
  
  const timeString = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/:/g, '.');
  
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
     name: "pivotColumns",
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
    defaultValue: ``,
  }
]);

const AGGREGATION_OPTIONS = ["SUM", "AVG", "MAX", "MIN"];

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  const pivotRows = config.pivotRows || [];
  const pivotColumns = config.pivotColumns || [];
  const measures = config.measures || [];
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to track if we've already auto-populated
  const autoPopulatedRef = useRef(false);

  const getDefaultSelection = (columns) =>
    columns.reduce(
      (acc, col, index) => ({ ...acc, [col]: index !== columns.length - 1 }),
      {}
    );

  const [rowColoredItemsMap, setRowColoredItemsMap] = useState(getDefaultSelection(pivotRows));
  const [rowCountOnMap, setRowCountOnMap] = useState(getDefaultSelection(pivotRows));
  
  const [colColoredItemsMap, setColColoredItemsMap] = useState(getDefaultSelection(pivotColumns));
  const [colCountOnMap, setColCountOnMap] = useState(getDefaultSelection(pivotColumns));
  
  const [measureAggregations, setMeasureAggregations] = useState(
    measures.reduce((acc, col) => ({ ...acc, [col]: "SUM" }), {})
  );
  
  const populateColumns = () => {
    if (!config.source || !elementColumns || Object.keys(elementColumns).length === 0) {
      return;
    }
    
    const textColumns = Object.keys(elementColumns).filter(col => {
      const colType = elementColumns[col]?.columnType;
      return colType === "text" || colType === "string" || colType === "datetime";
    });
    
    const halfIndex = Math.ceil(textColumns.length / 2);
    const pivotRowColumns = textColumns.slice(0, halfIndex);
    const pivotColumnColumns = textColumns.slice(halfIndex);
    
    const measureColumns = Object.keys(elementColumns).filter(col => {
      return elementColumns[col]?.columnType === "number";
    });
    
    if (pivotRowColumns.length > 0 || pivotColumnColumns.length > 0 || measureColumns.length > 0) {
      client.config.set({
        pivotRows: pivotRowColumns,
        pivotColumns: pivotColumnColumns,
        measures: measureColumns
      });
    }
  };
  
  const initialRenderRef = useRef(true);
  
  useEffect(() => {
    if (initialRenderRef.current && config.source && elementColumns) {
      initialRenderRef.current = false;
      autoPopulatedRef.current = true; 
      setTimeout(populateColumns, 0);
    }
  }, [config.source, elementColumns]);
  
  useEffect(() => {
    setRowColoredItemsMap(getDefaultSelection(pivotRows));
    setRowCountOnMap(getDefaultSelection(pivotRows));
  }, [pivotRows]);
  
  useEffect(() => {
    setColColoredItemsMap(getDefaultSelection(pivotColumns));
    setColCountOnMap(getDefaultSelection(pivotColumns));
  }, [pivotColumns]);

  useEffect(() => {
    setMeasureAggregations(
      measures.reduce(
        (acc, col) => ({ ...acc, [col]: measureAggregations[col] || "SUM" }),
        {}
      )
    );
  }, [measures]);

  const isExportDisabled = (pivotRows.length === 0 && pivotColumns.length === 0) || measures.length === 0 || isLoading;

  const handleRowCheckboxChange = (col) => {
    setRowColoredItemsMap((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleRowCountOnChange = (col) => {
    setRowCountOnMap((prev) => ({ ...prev, [col]: !prev[col] }));
  };
  
  const handleColCheckboxChange = (col) => {
    setColColoredItemsMap((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleColCountOnChange = (col) => {
    setColCountOnMap((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleAggregationChange = (col, value) => {
    setMeasureAggregations((prev) => ({ ...prev, [col]: value }));
  };
  
  const handleRefreshColumns = () => {
    // Directly call populate columns instead of toggling state
    autoPopulatedRef.current = true; // Mark as populated to avoid any loops
    populateColumns();
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
          coloredItems: rowColoredItemsMap[col] || false,
          countOn: rowCountOnMap[col] || false,
        })),
        pivotColumns: pivotColumns.map((col, index) => ({
          id: col,
          name: elementColumns[col]?.name || col,
          type: elementColumns[col]?.columnType || "unknown",
          order: index,
          coloredItems: colColoredItemsMap[col] || false,
          countOn: colCountOnMap[col] || false,
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
        data: Object.keys(sigmaData[(pivotRows[0] || pivotColumns[0])] || []).map((_, rowIndex) => {
          let row = {};
          [...pivotRows, ...pivotColumns, ...measures].forEach((col) => {
            let value = sigmaData[col][rowIndex];
            if (elementColumns[col]?.columnType === "datetime") {
              value = new Date(value).toISOString().split("T")[0];
            }
            row[col] = value;
          });
          return row;
        }),
      };
      
      const response = await fetch("https://bluewater-six.vercel.app/process", {
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
      a.download = `${fileName || `Export-${getCurrentDateTime()}`}.xlsx`;
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
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.heading}>Data Export Configuration</h3>
          {config.source && (
            <button 
              onClick={handleRefreshColumns}
              style={styles.refreshButton}
            >
              Refresh Columns
            </button>
          )}
        </div>
        
        <div style={styles.cardContent}>
          {/* Pivot Rows Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h4 style={styles.subheading}>Pivot Rows</h4>
              <p style={styles.description}>Select which pivot rows to highlight </p>
            </div>
            
            <div style={styles.itemList}>
              {pivotRows.length > 0 ? (
                pivotRows.map((col) => (
                  <div key={col} style={styles.pivotRowItem}>
                    <span style={styles.pivotName}>{elementColumns[col]?.name || col}</span>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={rowColoredItemsMap[col] || false}
                          onChange={() => handleRowCheckboxChange(col)}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>Highlight</span>
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={rowCountOnMap[col] || false}
                          onChange={() => handleRowCountOnChange(col)}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>Count On Label</span>
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.emptyMessage}>Please select pivot rows in the configuration panel</p>
              )}
            </div>
          </div>
          
          {/* Pivot Columns Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h4 style={styles.subheading}>Pivot Columns</h4>
              <p style={styles.description}>Select which pivot columns to highlight </p>
            </div>
            
            <div style={styles.itemList}>
              {pivotColumns.length > 0 ? (
                pivotColumns.map((col) => (
                  <div key={col} style={styles.pivotRowItem}>
                    <span style={styles.pivotName}>{elementColumns[col]?.name || col}</span>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={colColoredItemsMap[col] || false}
                          onChange={() => handleColCheckboxChange(col)}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>Highlight</span>
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={colCountOnMap[col] || false}
                          onChange={() => handleColCountOnChange(col)}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>Count On Label</span>
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.emptyMessage}>Please select pivot columns in the configuration panel</p>
              )}
            </div>
          </div>
        </div>
        
        <div style={styles.cardContent}>
          {/* Measures Section */}
          <div style={styles.fullSection}>
            <div style={styles.sectionHeader}>
              <h4 style={styles.subheading}>Measures</h4>
              <p style={styles.description}>Select aggregation type for measures.</p>
            </div>
            
            <div style={styles.itemList}>
              {measures.length > 0 ? (
                measures.map((col) => (
                  <div key={col} style={styles.measureRow}>
                    <span style={styles.measureName}>{elementColumns[col]?.name || col}</span>
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
        <div style={styles.cardFooter}>
          <button 
            onClick={handleSendData} 
            style={{
              ...styles.button,
              ...(isExportDisabled ? styles.buttonDisabled : {})
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
          
          {!isLoading && ((pivotRows.length === 0 && pivotColumns.length === 0) || measures.length === 0) && (
            <p style={styles.helperText}>
              {(pivotRows.length === 0 && pivotColumns.length === 0) && measures.length === 0 
                ? "Please select pivot rows/columns and measures to enable export" 
                : (pivotRows.length === 0 && pivotColumns.length === 0)
                  ? "Please select pivot rows or columns to enable export" 
                  : "Please select measures to enable export"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  card: {
    width: "680px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    border: "1px solid #eaedf2",
  },
  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #eaedf2",
    backgroundColor: "#f5f7fa",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  refreshButton: {
    padding: "8px 12px",
    backgroundColor: "#e2e8f0",
    color: "#334155",
    border: "none",
    borderRadius: "4px",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  cardContent: {
    padding: "20px",
    display: "flex",
    gap: "20px",
  },
  section: {
    flex: "1 1 50%",
  },
  fullSection: {
    flex: "1 1 100%",
  },
  sectionHeader: {
    marginBottom: "12px",
  },
  subheading: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 4px 0",
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
    lineHeight: "1.4",
  },
  itemList: {
    backgroundColor: "#f8f9fb",
    borderRadius: "6px",
    padding: "12px",
    border: "1px solid #eaedf2",
  },
  pivotRowItem: {
    display: "flex",
    flexDirection: "column",
    padding: "10px 0",
    borderBottom: "1px solid #eaedf2",
  },
  pivotName: {
    fontWeight: "500",
    fontSize: "15px",
    color: "#334155",
    marginBottom: "8px",
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#475569",
    cursor: "pointer",
    marginRight: "20px",
  },
  checkbox: {
    marginRight: "8px",
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  checkboxText: {
    fontSize: "14px",
  },
  measureRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eaedf2",
  },
  measureName: {
    fontWeight: "500",
    fontSize: "15px",
    color: "#334155",
  },
  dropdown: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#334155",
    cursor: "pointer",
    outline: "none",
    minWidth: "100px",
  },
  cardFooter: {
    padding: "0 20px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "500",
    backgroundColor: "#1e40af",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    transition: "background-color 0.2s ease",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTop: "3px solid white",
    animation: "spin 1s linear infinite",
  },
  emptyMessage: {
    fontSize: "14px",
    color: "#64748b",
    padding: "10px 0",
    textAlign: "center",
  },
  helperText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#dc2626",
    textAlign: "center",
  },
};

export default App;