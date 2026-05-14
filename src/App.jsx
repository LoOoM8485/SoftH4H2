import React, { useEffect, useMemo, useState } from "react";

const TABLES = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const START_NUMBERS = [1, 36, 71, 106, 141, 176, 211];
const ACTIONS = ["P", "F", "T", "R"];
const ROWS_PER_TABLE = 35;
const STORAGE_KEY = "soft-h4h-saved-v4";

function createRows() {
  return Array.from({ length: ROWS_PER_TABLE }, () => ({
    numberState: 0,
    bt: "",
    actions: { P: 0, F: 0, T: 0, R: 0 },
  }));
}

function createInitialBlocks() {
  return Array.from({ length: 3 }, (_, i) => ({
    tableNumber: TABLES[i],
    startNumber: 36,
    rows: createRows(),
  }));
}

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { visibleTables: 3, blocks: createInitialBlocks() };
}

function nextState(value) {
  if (value === 0) return 1;
  if (value === 1) return 2;
  return 0;
}

function cellStyle(value) {
  if (value === 1)
    return { background: "#22c55e", color: "white", borderColor: "#15803d" };
  if (value === 2)
    return { background: "#ef4444", color: "white", borderColor: "#b91c1c" };
  return { background: "white", color: "#111827", borderColor: "#cbd5e1" };
}

export default function App() {
  const saved = loadSaved();
  const [visibleTables, setVisibleTables] = useState(saved.visibleTables || 3);
  const [blocks, setBlocks] = useState(saved.blocks || createInitialBlocks());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ visibleTables, blocks }));
  }, [visibleTables, blocks]);

  const ensureBlocks = (count) => {
    setBlocks((current) => {
      const next = [...current];
      while (next.length < count) {
        next.push({
          tableNumber: TABLES[next.length] || 1,
          startNumber: 36,
          rows: createRows(),
        });
      }
      return next;
    });
  };

  const changeVisibleTables = (count) => {
    setVisibleTables(count);
    ensureBlocks(count);
  };

  const updateBlock = (blockIndex, updater) => {
    setBlocks((current) =>
      current.map((block, i) => (i === blockIndex ? updater(block) : block))
    );
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBlocks((current) =>
      current.map((block) => ({
        ...block,
        rows: createRows(),
      }))
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <header style={styles.header}>
          <div style={styles.logoBox}>
            <img src="/logo.png" alt="Triton Poker" style={styles.logo} />
            <h1 style={styles.title}>SOFT H4H</h1>
          </div>

          <div style={styles.topControls}>
            <label style={styles.topLabel}>
              TABLE COLUMNS
              <select
                value={visibleTables}
                onChange={(e) => changeVisibleTables(Number(e.target.value))}
                style={styles.topSelect}
              >
                <option value={1}>1 table</option>
                <option value={2}>2 tables</option>
                <option value={3}>3 tables</option>
              </select>
            </label>

            <button onClick={resetAll} style={styles.resetButton}>
              RESET
            </button>
          </div>
        </header>

        <main
          style={{
            ...styles.tableGrid,
            gridTemplateColumns: `repeat(${visibleTables}, 1fr)`,
          }}
        >
          {blocks.slice(0, visibleTables).map((block, blockIndex) => (
            <TableBlock
              key={blockIndex}
              block={block}
              blockIndex={blockIndex}
              updateBlock={updateBlock}
            />
          ))}
        </main>
      </div>
    </div>
  );
}

function TableBlock({ block, blockIndex, updateBlock }) {
  const rowNumbers = useMemo(
    () => Array.from({ length: ROWS_PER_TABLE }, (_, i) => block.startNumber + i),
    [block.startNumber]
  );

  const updateTableNumber = (value) => {
    updateBlock(blockIndex, (block) => ({ ...block, tableNumber: value }));
  };

  const updateStartNumber = (value) => {
    updateBlock(blockIndex, (block) => ({ ...block, startNumber: value }));
  };

  const updateBT = (rowIndex, value) => {
    updateBlock(blockIndex, (block) => ({
      ...block,
      rows: block.rows.map((row, i) =>
        i === rowIndex ? { ...row, bt: value } : row
      ),
    }));
  };

  const updateNumber = (rowIndex) => {
    updateBlock(blockIndex, (block) => ({
      ...block,
      rows: block.rows.map((row, i) =>
        i === rowIndex ? { ...row, numberState: nextState(row.numberState) } : row
      ),
    }));
  };

  const updateAction = (rowIndex, action) => {
    updateBlock(blockIndex, (block) => ({
      ...block,
      rows: block.rows.map((row, i) =>
        i === rowIndex
          ? {
              ...row,
              actions: {
                ...row.actions,
                [action]: nextState(row.actions[action]),
              },
            }
          : row
      ),
    }));
  };

  return (
    <section style={styles.block}>
      <div style={styles.controls}>
        <label style={styles.label}>
          TABLE #
          <select
            value={block.tableNumber}
            onChange={(e) => updateTableNumber(Number(e.target.value))}
            style={styles.select}
          >
            {TABLES.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          START #
          <select
            value={block.startNumber}
            onChange={(e) => updateStartNumber(Number(e.target.value))}
            style={styles.select}
          >
            {START_NUMBERS.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.tableTitle}>TABLE #{block.tableNumber}</div>

      {block.rows.map((row, rowIndex) => (
        <div key={rowIndex} style={styles.row}>
          <button
            type="button"
            onClick={() => updateNumber(rowIndex)}
            style={{ ...styles.cellButton, ...cellStyle(row.numberState) }}
          >
            {rowNumbers[rowIndex]}
          </button>

          <select
            value={row.bt}
            onChange={(e) => updateBT(rowIndex, e.target.value)}
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
              type="button"
              key={action}
              onClick={() => updateAction(rowIndex, action)}
              style={{ ...styles.cellButton, ...cellStyle(row.actions[action]) }}
            >
              {action}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e5e7eb",
    padding: 8,
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
    overflowX: "auto",
  },
  app: {
    minWidth: 760,
    maxWidth: 1180,
    margin: "0 auto",
    background: "white",
    borderRadius: 14,
    padding: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoBox: {
    textAlign: "center",
    flex: 1,
  },
  logo: {
    height: 90,
    maxWidth: 260,
    objectFit: "contain",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
    color: "#000",
  },
  topControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: 900,
    color: "#000",
  },
  topSelect: {
    display: "block",
    marginTop: 2,
    padding: 6,
    fontSize: 15,
    fontWeight: 900,
    borderRadius: 8,
    border: "1px solid #94a3b8",
    background: "white",
    color: "#000",
  },
  resetButton: {
    border: "2px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 14,
    cursor: "pointer",
  },
  tableGrid: {
    display: "grid",
    gap: 8,
  },
  block: {
    border: "2px solid #111827",
    borderRadius: 10,
    overflow: "hidden",
    background: "#f8fafc",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 5,
    padding: 5,
    background: "#ffffff",
  },
  label: {
    fontSize: 10,
    fontWeight: 900,
    color: "#000",
  },
  select: {
    width: "100%",
    marginTop: 2,
    padding: 5,
    fontSize: 16,
    fontWeight: 900,
    borderRadius: 7,
    border: "1px solid #94a3b8",
    background: "white",
    color: "#000",
  },
  tableTitle: {
    background: "#111827",
    color: "white",
    textAlign: "center",
    fontWeight: 900,
    fontSize: 18,
    padding: "5px 0",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "42px 46px 1fr 1fr 1fr 1fr",
    gap: 2,
    padding: "2px",
    background: "#cbd5e1",
  },
  cellButton: {
    minHeight: 22,
    border: "1px solid",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 900,
    padding: 0,
    cursor: "pointer",
    color: "#000",
  },
  btSelect: {
    minHeight: 22,
    border: "1px solid #d6b94c",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 900,
    padding: 0,
    background: "#fef3c7",
    color: "#000",
    textAlign: "center",
    cursor: "pointer",
  },
};