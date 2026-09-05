import React, { useEffect, useMemo, useState } from "react";

const TABLES = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const START_NUMBERS = [1, 36, 71, 106, 141, 176, 211];
const ACTIONS = ["P", "F", "T", "R"];
const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];
const ROWS_PER_TABLE = 35;
const MAX_TABLE_BLOCKS = 10;
const STORAGE_KEY = "soft-h4h-saved-v5";

function createRows() {
  return Array.from({ length: ROWS_PER_TABLE }, () => ({
    numberState: 0,
    bt: "",
    actions: { P: 0, F: 0, T: 0, R: 0 },
  }));
}

function createInitialBlocks() {
  return Array.from({ length: MAX_TABLE_BLOCKS }, (_, i) => ({
    tableNumber: TABLES[i] || 1,
    startNumber: 36,
    playerCount: 8,
    rows: createRows(),
  }));
}

function normalizePlayerCount(value) {
  const count = Number(value);
  return PLAYER_COUNTS.includes(count) ? count : 8;
}

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        blocks: (parsed.blocks || createInitialBlocks()).map((block) => ({
          ...block,
          playerCount: normalizePlayerCount(block.playerCount),
        })),
      };
    }
  } catch {}

  return { visibleTables: 3, blocks: createInitialBlocks() };
}

function nextState(value) {
  if (value === 0) return 1;
  if (value === 1) return 2;
  return 0;
}

function stateClass(value) {
  if (value === 1) return "is-green";
  if (value === 2) return "is-red";
  return "is-neutral";
}

export default function App() {
  const initial = useMemo(() => loadSaved(), []);
  const [visibleTables, setVisibleTables] = useState(initial.visibleTables || 3);
  const [blocks, setBlocks] = useState(initial.blocks || createInitialBlocks());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ visibleTables, blocks }));
  }, [visibleTables, blocks]);

  useEffect(() => {
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  const markedRows = useMemo(() => {
    return blocks.slice(0, visibleTables).reduce((count, block) => {
      return (
        count +
        block.rows.filter(
          (row) =>
            row.numberState !== 0 ||
            row.bt !== "" ||
            ACTIONS.some((action) => row.actions[action] !== 0)
        ).length
      );
    }, 0);
  }, [blocks, visibleTables]);

  const totalPlayers = useMemo(
    () =>
      blocks
        .slice(0, visibleTables)
        .reduce((total, block) => total + normalizePlayerCount(block.playerCount), 0),
    [blocks, visibleTables]
  );

  const updateBlock = (blockIndex, updater) => {
    setBlocks((current) =>
      current.map((block, i) => (i === blockIndex ? updater(block) : block))
    );
  };

  const resetAll = () => {
    if (!window.confirm("Reset all Soft H4H marks? Table, player-count and start-number selections will stay in place.")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setBlocks((current) =>
      current.map((block) => ({
        ...block,
        rows: createRows(),
      }))
    );
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  return (
    <div className="app-shell">
      <div className="app-surface">
        <header className="app-header">
          <div className="brand-lockup">
            <div className="brand-logo-wrap">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Triton Poker" className="brand-logo" />
            </div>
            <div>
              <div className="eyebrow">LIVE EVENTS · OPERATIONS TOOL</div>
              <h1>SOFT HAND-FOR-HAND</h1>
              <p className="subtitle">Fast live hand tracking across active tables</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="status-card">
              <span className="status-dot" />
              <span>
                <strong>AUTO-SAVED</strong>
                <small>on this device</small>
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">TABLES</span>
              <strong>{visibleTables}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">PLAYERS</span>
              <strong>{totalPlayers}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">MARKED ROWS</span>
              <strong>{markedRows}</strong>
            </div>

            <button className="utility-button" type="button" onClick={toggleFullscreen}>
              {isFullscreen ? "EXIT FULL" : "FULL SCREEN"}
            </button>

            <button className="danger-button" type="button" onClick={resetAll}>
              RESET
            </button>
          </div>
        </header>

        <div className="control-strip">
          <label className="control-field">
            <span>TABLE COLUMNS</span>
            <select
              value={visibleTables}
              onChange={(e) => setVisibleTables(Number(e.target.value))}
            >
              {Array.from({ length: MAX_TABLE_BLOCKS }, (_, i) => i + 1).map(
                (number) => (
                  <option key={number} value={number}>
                    {number} table{number > 1 ? "s" : ""}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="legend" aria-label="Cell state legend">
            <span className="legend-title">TAP CYCLE</span>
            <span><i className="legend-swatch neutral" /> Neutral</span>
            <span><i className="legend-swatch green" /> Green</span>
            <span><i className="legend-swatch red" /> Red</span>
          </div>
        </div>

        <PlayerCountDock
          blocks={blocks}
          visibleTables={visibleTables}
          updateBlock={updateBlock}
          totalPlayers={totalPlayers}
        />

        <main
          className="tables-board"
          style={{ gridTemplateColumns: `repeat(${visibleTables}, minmax(330px, 355px))` }}
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

function PlayerCountDock({ blocks, visibleTables, updateBlock, totalPlayers }) {
  const setPlayerCount = (blockIndex, playerCount) => {
    updateBlock(blockIndex, (current) => ({ ...current, playerCount }));
  };

  return (
    <section className="player-count-dock" aria-label="Players at each active table">
      <div className="player-count-dock-heading">
        <span>PLAYERS AT TABLE</span>
        <strong>{totalPlayers} TOTAL</strong>
      </div>

      <div
        className="player-count-grid"
        style={{ gridTemplateColumns: `repeat(${visibleTables}, minmax(330px, 355px))` }}
      >
        {blocks.slice(0, visibleTables).map((block, blockIndex) => (
          <div className="player-count-card" key={blockIndex}>
            <div className="player-count-card-title">TABLE {block.tableNumber}</div>
            <div className="player-count-options">
              {PLAYER_COUNTS.map((count) => (
                <button
                  type="button"
                  key={count}
                  className={`player-count-button ${normalizePlayerCount(block.playerCount) === count ? "is-selected" : ""}`}
                  onClick={() => setPlayerCount(blockIndex, count)}
                  aria-pressed={normalizePlayerCount(block.playerCount) === count}
                  aria-label={`Table ${block.tableNumber}: ${count} player${count === 1 ? "" : "s"}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TableBlock({ block, blockIndex, updateBlock }) {
  const rowNumbers = useMemo(
    () => Array.from({ length: ROWS_PER_TABLE }, (_, i) => block.startNumber + i),
    [block.startNumber]
  );

  const updateTableNumber = (value) => {
    updateBlock(blockIndex, (current) => ({ ...current, tableNumber: value }));
  };

  const updateStartNumber = (value) => {
    updateBlock(blockIndex, (current) => ({ ...current, startNumber: value }));
  };

  const updateBT = (rowIndex, value) => {
    updateBlock(blockIndex, (current) => ({
      ...current,
      rows: current.rows.map((row, i) =>
        i === rowIndex ? { ...row, bt: value } : row
      ),
    }));
  };

  const updateNumber = (rowIndex) => {
    updateBlock(blockIndex, (current) => ({
      ...current,
      rows: current.rows.map((row, i) =>
        i === rowIndex
          ? { ...row, numberState: nextState(row.numberState) }
          : row
      ),
    }));
  };

  const updateAction = (rowIndex, action) => {
    updateBlock(blockIndex, (current) => ({
      ...current,
      rows: current.rows.map((row, i) =>
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
    <section className="table-card">
      <div className="table-toolbar">
        <label>
          <span>TABLE #</span>
          <select
            value={block.tableNumber}
            onChange={(e) => updateTableNumber(Number(e.target.value))}
          >
            {TABLES.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>START #</span>
          <select
            value={block.startNumber}
            onChange={(e) => updateStartNumber(Number(e.target.value))}
          >
            {START_NUMBERS.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-title-row">
        <span className="table-kicker">ACTIVE TABLE</span>
        <strong>TABLE {block.tableNumber}</strong>
      </div>

      <div className="row-grid row-grid-header">
        <div>#</div>
        <div>BT</div>
        {ACTIONS.map((action) => (
          <div key={action}>{action}</div>
        ))}
      </div>

      <div className="rows-wrap">
        {block.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row-grid hand-row">
            <button
              type="button"
              title={`Hand ${rowNumbers[rowIndex]}`}
              onClick={() => updateNumber(rowIndex)}
              className={`state-cell hand-number ${stateClass(row.numberState)}`}
            >
              {rowNumbers[rowIndex]}
            </button>

            <select
              value={row.bt}
              onChange={(e) => updateBT(rowIndex, e.target.value)}
              className="bt-select"
              aria-label={`Break table for hand ${rowNumbers[rowIndex]}`}
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
                title={`${action} · hand ${rowNumbers[rowIndex]}`}
                onClick={() => updateAction(rowIndex, action)}
                className={`state-cell ${stateClass(row.actions[action])}`}
              >
                {action}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
