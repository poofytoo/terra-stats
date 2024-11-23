export const runtime = 'nodejs'; // Specify the runtime explicitly
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false

const convertGridToBuffer = (grid: number[][][]): Buffer => {
  const buffer = Buffer.alloc(16 * 16 * 3); // Allocate buffer for 768 bytes

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const [r, g, b] = grid[row][col];
      const index = (row * 16 + col) * 3;
      buffer[index] = r;     // Red
      buffer[index + 1] = g; // Green
      buffer[index + 2] = b; // Blue
    }
  }

  return buffer;
};

const clearAll = (): number[][][] => {
  const grid = [];
  for (let row = 0; row < 16; row++) {
    const rowArray = [];
    for (let col = 0; col < 16; col++) {
      rowArray.push([0, 0, 0]); // Black RGB values
    }
    grid.push(rowArray);
  }
  return grid;
};

export async function GET(request: Request) {

  const grid = clearAll(); // Clear all LEDs
  grid[0][0] = [255, 0, 0]; // Set top-left LED to red
  grid[0][15] = [0, 255, 0]; // Set top-right LED to green
  grid[15][0] = [0, 0, 255]; // Set bottom-left LED to blue
  grid[15][15] = [255, 255, 255]; // Set bottom-right LED to white

  const buffer = convertGridToBuffer(grid);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
  });
}