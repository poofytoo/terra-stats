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

        // Parse the RGB data into a 2D array with serpentine layout
        const grid: number[][][] = [];
        for (let row = 0; row < gridSize * 4; row++) {
          const rowArray: number[][] = [];
          for (let col = 0; col < gridSize; col++) {
            // Handle serpentine style
            const serpentineCol = row % 2 === 0 ? gridSize - col - 1 : col; // Reverse column for even rows
            const index = (row * gridSize + serpentineCol) * 3;

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            rowArray.push([r, g, b]); // Push RGB tuple
          }
          grid.push(rowArray);
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
    <div style={{
      display: "flex",
      alignItems: "center",
      backgroundColor: "black",
      minHeight: "100vh",
      gap: "20px"
    }}>
      <h1>LED Grid Simulator</h1>
      {gridData ? (
        <div>
          {[[...Array(4).keys()].map((_, idx) => {
            const gridToDisplay = gridData.slice(idx * gridSize, (idx + 1) * gridSize);
            return <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridSize}, 20px)`, // Adjust size of squares
                gap: "2px",
                border: '2px solid #333333',
              }}
              key={idx}
            >
              {gridToDisplay.flat().map(([r, g, b], idx2) => (
                <div
                  key={idx2}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: `rgb(${r}, ${g}, ${b})`,
                  }}
                />
              ))}
            </div>
          })]}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LEDGridSimulator;