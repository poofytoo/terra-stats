import React, { useEffect, useState } from 'react';
import styles from './TableGrid.module.css';
import { gab } from '@/libs/util';

export interface TableColumn {
  header: string | JSX.Element;
  key: string;
  className?: string; // updated the property name to follow convention
  shrinkable?: boolean;
}

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, any>[];
}

interface TableProps {
  data: TableData;
  condensable?: boolean;
}

// For condensable
const topCount = 5;
const bottomCount = 5;

const TableGrid: React.FC<TableProps> = ({ data, condensable }) => {

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const showAll = window.localStorage.getItem('showAll');
      if (showAll) {
        setShowAll(JSON.parse(showAll));
      }
    }
  }, []);

  const gridTemplateColumns = `${[...Array(data.columns.length)].map((_, key) => {
    if (data.columns[key].shrinkable) return `minmax(50px, auto)`
    return `minmax(max-content, 1fr)`
  }).join(' ')}`;
  const rowsToDisplay = condensable && !showAll
    ? [...data.rows.slice(0, topCount), 'break', ...data.rows.slice(-bottomCount)]
    : data.rows;

  return (<>
    {condensable && (showAll ?
      <button className={gab.className} onClick={() => {
        setShowAll(false);
        window.localStorage.setItem('showAll', JSON.stringify(false));
      }}>Condense</button>
      : (
        <button className={gab.className} onClick={() => {
          setShowAll(true);
          window.localStorage.setItem('showAll', JSON.stringify(true));
        }}>Show All</button>
      ))}
    <div className={styles.tableContainer} style={{ gridTemplateColumns }}>
      {data.columns.map((column) => (
        <div key={column.key} className={`${styles.tableHeader} ${column.className || ''}`}>
          {column.header}
        </div>
      ))}
      {rowsToDisplay.map((row, rowIndex) => {
        if (row === 'break') return (
          <div key={rowIndex} className={styles.row}>
            <div className={styles.tableCell} style={{ gridColumn: '1 / -1' }}>
              ...
            </div>
          </div>
        );
        return <div key={rowIndex} className={styles.row}>
          {data.columns.map((column) => (
            <div key={column.key} className={`${styles.tableCell} ${column.className || ''}`}>
              {(row as any)[column.key]}
            </div>
          ))}
        </div>
      })}
    </div>
  </>
  );
};

export default TableGrid;
