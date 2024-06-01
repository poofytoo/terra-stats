import React from 'react';
import styles from './TableGrid.module.css';

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
}

const TableGrid: React.FC<TableProps> = ({ data }) => {
  const gridTemplateColumns = `repeat(${data.columns.length}, minmax(max-content, 1fr))`;

  return (
    <div className={styles.tableContainer} style={{ gridTemplateColumns }}>
      {data.columns.map((column) => (
        <div key={column.key} className={`${styles.tableHeader} ${column.className || ''}`}>
          {column.header}
        </div>
      ))}
      {data.rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {data.columns.map((column) => (
            <div key={column.key} className={`${styles.tableCell} ${column.className || ''}`}>
              {row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableGrid;
