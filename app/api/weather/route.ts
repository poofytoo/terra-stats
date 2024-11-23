export const runtime = 'nodejs'; // Specify the runtime explicitly
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false

const ON_COLOR = [200, 150, 20];

const condensedOne = [
  [1, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
]

const pixelNumbers = [
  // 0
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  // 1
  [
    [0, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  // 2
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  // 3
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  // 4
  [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  // 5
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  // 6
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  // 7
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  // 8
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  // 9
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
];

const convertGridToBuffer = (grid: number[][][]): Buffer => {
  const buffer = Buffer.alloc(16 * 16 * 3); // Allocate buffer for 768 bytes

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const [r, g, b] = grid[row][col];

      // Calculate the index based on serpentine layout
      const serpentineCol = row % 2 === 0 ? 15 - col : col; // Reverse column for even rows
      const index = (row * 16 + serpentineCol) * 3;

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

const placeDigit = (grid: number[][][], digit: number, c: number, r: number) => {
  const digitDisplay2 = pixelNumbers[digit];
  for (let i = r; i < r + 7; i++) {
    for (let j = c; j < c + 3; j++) {
      grid[i][j] = digitDisplay2[i - r][j - c] === 1 ? ON_COLOR : [0, 0, 0];
    }
  }
}

export async function GET(request: Request) {

  const grid = clearAll(); // Clear all LEDs

  // grid[0][0] = [255, 0, 0]; // Set top-left LED to red
  // grid[0][15] = [0, 255, 0]; // Set top-right LED to green
  // grid[15][0] = [0, 0, 255]; // Set bottom-left LED to blue
  // grid[15][15] = [255, 255, 255]; // Set bottom-right LED to white


  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York", // Eastern Time (ET)
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const currentETTime = formatter.format(now);
  const hourIn12HourFormat = parseInt(currentETTime.split(":")[0]);
  const minute = now.getMinutes();
  const seconds = now.getSeconds();

  console.log("Current time in ET:", currentETTime);

  // first digit
  // if (hourIn12HourFormat >= 10) {
  //   for (let i = 1; i < 3; i ++)}{
  //     for (let j = 1; j < 8; j++) {
  //       grid[i][j] = condensedOne[i][j];
  //     }
  //   }

  // second digit 

  const secondDigit = hourIn12HourFormat % 10;
  placeDigit(grid, secondDigit, 3, 1);
  // colon
  if (seconds % 2 === 0) {
    grid[3][7] = ON_COLOR;
    grid[6][7] = ON_COLOR;
  }
  const thirdDigit = Math.floor(minute / 10);
  placeDigit(grid, thirdDigit, 9, 1);
  const fourthDigit = minute % 10;
  placeDigit(grid, fourthDigit, 13, 1);

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