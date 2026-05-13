import React, { useState } from "react";

const ACTIONS = ["P", "F", "T", "R"];
const TABLES = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const START_NUMBERS = [1, 36, 71, 106, 141, 176, 211];
const ROWS_PER_TABLE = 35;

function createRows() {
  return Array.from({ length: ROWS_PER_TABLE }, () => ({
    numberState: 0,
    bt: "",
    actions: { P: 0, F: 0, T: 0, R: 0 },
  }));
}

function createInitialBlocks(count) {
  return Array.from({ length: count }, (_, i) => ({
    tableNumber: TABLES[i] || TABLES[0],
    startNumber: START_NUMBERS[i] || START_NUMBERS[0],
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
      WebkitTextFillColor: "black",
    };
  }

  if (value === 2) {
    return {
      background: "#ef4444",
      color: "white",
      borderColor: "#b91c1c",
      WebkitTextFillColor: "white",
    };
  }

  return {
    background: "white",
    color: "black",
    borderColor: "#cbd5e1",
    WebkitTextFillColor: "black",
  };
}

export default function App() {
  const [tableCount, setTableCount] = useState(3);
  const [blocks, setBlocks] = useState(() => createInitialBlocks(3));

  const changeTableCount = (newCount) => {
    setTableCount(newCount);

    setBlocks((current) => {
      if (newCount > current.length) {
        const extra = Array.from(
          { length: newCount - current.length },
          (_, i) => {
            const index = current.length + i;

            return {
              tableNumber: TABLES[index] || TABLES[0],
              startNumber: START_NUMBERS[index] || START_NUMBERS[0],
              rows: createRows(),
            };
          }
        );

        return [...current, ...extra];
      }

      return current.slice(0, newCount);
    });
  };

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
    setBlocks(createInitialBlocks(tableCount));
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

        <div style={styles.topBar}>
          <div style={styles.explanation}>
            1 tap = green • 2 taps = red • 3 taps = clear
          </div>

          <label style={styles.tableCountLabel}>
            TABLE COLUMNS
            <select
              value={tableCount}
              onChange={(e) => changeTableCount(Number(e.target.value))}
              style={styles.tableCountSelect}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={styles.scrollArea}>
          <div
            style={{
              ...styles.grid,
              gridTemplateColumns: `repeat(${tableCount}, 360px)`,
            }}
          >
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

  topBar: {
    display: "grid",
    gridTemplateColumns: "1fr 170px",
    gap: 10,
    marginBottom: 10,
    alignItems: "stretch",
  },

  explanation: {
    border: "2px solid #666",
    borderRadius: 10,
    textAlign: "center",
    padding: 10,
    background: "white",
    color: "black",
    fontWeight: 700,
  },

  tableCountLabel: {
    border: "2px solid #666",
    borderRadius: 10,
    background: "white",
    color: "black",
    fontWeight: 900,
    fontSize: 12,
    padding: 6,
    textAlign: "center",
  },

  tableCountSelect: {
    width: "100%",
    marginTop: 4,
    padding: 6,
    borderRadius: 8,
    border: "1px solid #bbb",
    background: "white",
    color: "black",
    WebkitTextFillColor: "black",
    fontWeight: 900,
    fontSize: 16,
  },

  scrollArea: {
    overflowX: "auto",
    paddingBottom: 10,
  },

  grid: {
    display: "grid",
    gap: 10,
    minWidth: "max-content",
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
  },
};