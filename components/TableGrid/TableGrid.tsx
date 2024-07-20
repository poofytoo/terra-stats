import React, { useEffect, useState } from 'react';
import styles from './TableGrid.module.css';
import { gab } from '@/libs/util';

export interface TableColumn {
  header: string | JSX.Element;
  key: string;
  className?: string;
  shrinkable?: boolean;
  sortable?: boolean;
}

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, any>[];
}

interface TableProps {
  data: TableData;
  condensable?: boolean;
  tableId: string; // Unique identifier for the table
}

const topCount = 5;
const bottomCount = 5;

const TableGrid: React.FC<TableProps> = ({ data, condensable, tableId }) => {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const showAll = window.localStorage.getItem(`${tableId}-showAll`);
      const savedSortBy = window.localStorage.getItem(`${tableId}-sortBy`);
      const savedSortDirection = window.localStorage.getItem(`${tableId}-sortDirection`);
      if (showAll) {
        setShowAll(JSON.parse(showAll));
      }
      if (savedSortBy) {
        setSortBy(savedSortBy);
      }
      if (savedSortDirection) {
        setSortDirection(savedSortDirection as 'asc' | 'desc');
      }
    }
  }, [tableId]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      window.localStorage.setItem(`${tableId}-sortDirection`, newDirection);
    } else {
      setSortBy(key);
      setSortDirection('asc');
      window.localStorage.setItem(`${tableId}-sortBy`, key);
      window.localStorage.setItem(`${tableId}-sortDirection`, 'asc');
    }
  };

  const sortedRows = [...data.rows].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[`${sortBy}_raw`] !== undefined ? a[`${sortBy}_raw`] : a[sortBy];
    const bValue = b[`${sortBy}_raw`] !== undefined ? b[`${sortBy}_raw`] : b[sortBy];

    if (aValue === bValue) return 0;
    return (aValue > bValue ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1);
  });

  const rowsToDisplay = condensable && !showAll
    ? [...sortedRows.slice(0, topCount), 'break', ...sortedRows.slice(-bottomCount)]
    : sortedRows;

  const gridTemplateColumns = `${[...Array(data.columns.length)].map((_, key) => {
    if (data.columns[key].shrinkable) return `minmax(10px, auto)`;
    return `minmax(max-content, 1fr)`;
  }).join(' ')}`;

  return (
    <>
      {condensable && (showAll ?
        <button className={gab.className} onClick={() => {
          setShowAll(false);
          window.localStorage.setItem(`${tableId}-showAll`, JSON.stringify(false));
        }}>Condense</button>
        : (
          <button className={gab.className} onClick={() => {
            setShowAll(true);
            window.localStorage.setItem(`${tableId}-showAll`, JSON.stringify(true));
          }}>Show All</button>
        ))}
      <div className={styles.tableContainer} style={{ gridTemplateColumns }}>
        {data.columns.map((column) => (
          <div
            key={column.key}
            className={`${styles.tableHeader} ${column.className || ''}`}
            onClick={() => column.sortable !== false && handleSort(column.key)}
            style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
          >
            <span>
              {column.header}
              {sortBy === column.key && (
                <span className={styles.sortArrow}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </span>
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
          return (
            <div key={rowIndex} className={styles.row}>
              {data.columns.map((column) => (
                <div key={column.key} className={`${styles.tableCell} ${column.className || ''}`}>
                  {(row as any)[column.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TableGrid;
