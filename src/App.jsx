import React, { useState } from "react";

const ACTIONS = ["P", "F", "T", "R"];
const TABLES = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const START_NUMBERS = [1, 36, 71, 106, 141, 176, 211];
const ROWS_PER_TABLE = 35;
const TABLE_BLOCKS = 3;

function createRows() {
  return Array.from({ length: ROWS_PER_TABLE }, () => ({
    numberState: 0,
    bt: "",
    actions: { P: 0, F: 0, T: 0, R: 0 },
  }));
}

function createInitialBlocks() {
  return Array.from({ length: TABLE_BLOCKS }, (_, i) => ({
    tableNumber: TABLES[i],
    startNumber: START_NUMBERS[i],
    rows: createRows(),
  }));
}

function nextCellState(value) {
  if (value === 0) return 1;
  if (value === 1) return 2;
  return 0;
}

function cellStyle(value) {
  if (value === 1) {
    return {
      background: "#6bcf43",
      color: "black",
      borderColor: "#4d9d2f",
    };
  }

  if (value === 2) {
    return {
      background: "#ef4444",
      color: "white",
      borderColor: "#b91c1c",
    };
  }

  return {
    background: "white",
    color: "black",
    borderColor: "#cbd5e1",
  };
}

export default function App() {
  const [blocks, setBlocks] = useState(createInitialBlocks);

  const updateAction = (blockIndex, rowIndex, action) => {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== blockIndex) return block;

        return {
          ...block,
          rows: block.rows.map((row, r) => {
            if (r !== rowIndex) return row;

            return {
              ...row,
              actions: {
                ...row.actions,
                [action]: nextCellState(row.actions[action]),
              },
            };
          }),
        };
      })
    );
  };

  const updateNumber = (blockIndex, rowIndex) => {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== blockIndex) return block;

        return {
          ...block,
          rows: block.rows.map((row, r) =>
            r === rowIndex
              ? {
                  ...row,
                  numberState: nextCellState(row.numberState),
                }
              : row
          ),
        };
      })
    );
  };

  const updateBT = (blockIndex, rowIndex, value) => {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== blockIndex) return block;

        return {
          ...block,
          rows: block.rows.map((row, r) =>
            r === rowIndex ? { ...row, bt: value } : row
          ),
        };
      })
    );
  };

  const updateTableNumber = (blockIndex, value) => {
    setBlocks((current) =>
      current.map((block, i) =>
        i === blockIndex ? { ...block, tableNumber: value } : block
      )
    );
  };

  const updateStartNumber = (blockIndex, value) => {
    setBlocks((current) =>
      current.map((block, i) =>
        i === blockIndex ? { ...block, startNumber: value } : block
      )
    );
  };

  const resetAll = () => {
    setBlocks(createInitialBlocks());
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ width: 120 }} />

          <div style={styles.logoBox}>
            <div style={styles.logoText}>TRITON POKER SERIES</div>
            <div style={styles.title}>SOFT H4H</div>
          </div>

          <button onClick={resetAll} style={styles.resetButton}>
            RESET
          </button>
        </div>

        <div style={styles.legend}>
          1 tap = green • 2 taps = red • 3 taps = clear
        </div>

        <div style={styles.grid}>
          {blocks.map((block, blockIndex) => (
            <div key={blockIndex} style={styles.block}>
              <div style={styles.topControls}>
                <div>
                  <div style={styles.controlLabel}>TABLE #</div>

                  <select
                    value={block.tableNumber}
                    onChange={(e) =>
                      updateTableNumber(blockIndex, Number(e.target.value))
                    }
                    style={styles.select}
                  >
                    {TABLES.map((table) => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={styles.controlLabel}>START #</div>

                  <select
                    value={block.startNumber}
                    onChange={(e) =>
                      updateStartNumber(blockIndex, Number(e.target.value))
                    }
                    style={styles.select}
                  >
                    {START_NUMBERS.map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.tableTitle}>TABLE #{block.tableNumber}</div>

              {block.rows.map((row, rowIndex) => {
                const rowNumber = block.startNumber + rowIndex;

                return (
                  <div key={rowIndex} style={styles.row}>
                    <button
                      onClick={() => updateNumber(blockIndex, rowIndex)}
                      style={{
                        ...styles.cell,
                        ...cellStyle(row.numberState),
                      }}
                    >
                      {rowNumber}
                    </button>

                    <select
                      value={row.bt}
                      onChange={(e) =>
                        updateBT(blockIndex, rowIndex, e.target.value)
                      }
                      style={styles.btSelect}
                    >
                      <option value="">-</option>

                      {TABLES.map((table) => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>

                    {ACTIONS.map((action) => (
                      <button
                        key={action}
                        onClick={() =>
                          updateAction(blockIndex, rowIndex, action)
                        }
                        style={{
                          ...styles.cell,
                          ...cellStyle(row.actions[action]),
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#ececec",
    minHeight: "100vh",
    padding: 10,
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "black",
  },

  container: {
    maxWidth: 1400,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  logoBox: {
    textAlign: "center",
  },

  logoText: {
    color: "#d4a017",
    fontWeight: 900,
    fontSize: 28,
    letterSpacing: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: 900,
    marginTop: 2,
    color: "black",
  },

  resetButton: {
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px 18px",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    WebkitTextFillColor: "white",
  },

  legend: {
    border: "2px solid #666",
    borderRadius: 10,
    textAlign: "center",
    padding: 10,
    marginBottom: 10,
    background: "white",
    color: "black",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  block: {
    background: "#f8f8f8",
    border: "2px solid #666",
    borderRadius: 10,
    padding: 4,
  },

  topControls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 8,
  },

  controlLabel: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 14,
    marginBottom: 4,
    color: "black",
  },

  select: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #bbb",
    fontWeight: 900,
    fontSize: 16,
    background: "white",
    color: "black",
    WebkitTextFillColor: "black",
    appearance: "auto",
  },

  tableTitle: {
    background: "black",
    color: "white",
    textAlign: "center",
    fontWeight: 900,
    fontSize: 20,
    borderRadius: 6,
    padding: 6,
    marginBottom: 4,
    WebkitTextFillColor: "white",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 4,
    marginBottom: 4,
  },

  cell: {
    height: 38,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
    color: "black",
    WebkitTextFillColor: "black",
  },

  btSelect: {
    height: 38,
    borderRadius: 6,
    border: "1px solid #e1c14d",
    background: "#fff6c7",
    color: "black",
    WebkitTextFillColor: "black",
    fontWeight: 900,
    fontSize: 16,
    textAlign: "center",
    cursor: "pointer",
    appearance: "auto",
  },
};