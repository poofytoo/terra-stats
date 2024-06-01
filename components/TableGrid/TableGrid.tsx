import React, { useState } from 'react';
import styles from './TableGrid.module.css';
import { gab } from '@/utils';

export interface TableColumn {
  header: string;
  key: string;
  className?: string; // updated the property name to follow convention
}

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, any>[];
}

interface TableProps {
  data: TableData;
  condensed?: boolean;
}

const TableGrid: React.FC<TableProps> = ({ data, condensed }) => {

  const [showAll, setShowAll] = useState(false);
  const topCount = 5;
  const bottomCount = 5;

  const gridTemplateColumns = `repeat(${data.columns.length}, minmax(max-content, 1fr))`;
  const rowsToDisplay = condensed && !showAll
    ? [...data.rows.slice(0, topCount), 'break', ...data.rows.slice(-bottomCount)]
    : data.rows;

  return (<>
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
    {condensed && !showAll && (
      <button className={gab.className} onClick={() => {
        if (condensed) {
          setShowAll(true)
        }
      }}>Show All</button>
    )}
  </>
  );
};

export default TableGrid;
