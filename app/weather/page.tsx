"use client";

import React, { useEffect, useState } from "react";

const LEDGridSimulator: React.FC = () => {
  const gridSize = 16; // 16x16 grid
  const [gridData, setGridData] = useState<number[][][] | null>(null);

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        const response = await fetch("/api/weather");
        const buffer = await response.arrayBuffer(); // Fetch raw binary data
        const data = new Uint8Array(buffer);

        // Parse the RGB data into a 2D array
        const grid: number[][][] = [];
        for (let i = 0; i < gridSize; i++) {
          const row: number[][] = [];
          for (let j = 0; j < gridSize; j++) {
            const index = (i * gridSize + j) * 3;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            row.push([r, g, b]); // Push RGB tuple
          }
          grid.push(row);
        }
        setGridData(grid);
      } catch (error) {
        console.error("Error fetching grid data:", error);
      }
    };

    // Fetch the data initially and set up a periodic fetch
    fetchGridData();
    const interval = setInterval(fetchGridData, 1000); // Fetch every second
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>LED Grid Simulator</h1>
      {gridData ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, 20px)`, // Adjust size of squares
            gap: "2px",
          }}
        >
          {gridData.flat().map(([r, g, b], idx) => (
            <div
              key={idx}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
              }}
            />
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LEDGridSimulator;