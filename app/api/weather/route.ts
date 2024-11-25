import fetch from 'node-fetch'; // Import fetch for server-side requests

export const runtime = 'nodejs'; // Specify the runtime explicitly
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false

const ON_COLOR = [225, 60, 5];
const ON_COLOR_2 = [0, 80, 30];
const OPENWEATHER_API_KEY = process.env.WEATHER_KEY; // Replace with your API key
const ZIP_CODE = '02141';
const COUNTRY_CODE = 'US';

const UPDATE_FREQUENCY = 3 * 60 * 1000; // Update every 3 minutes
let lastFetchTime = 0;
let cachedTemperature: number | null = null;

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
    [1, 0, 1],
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

const smallPixelNumbers = [
  // 0
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  // 1
  [
    [1, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  // 2
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
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
  ],
  // 5
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  // 6
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  // 7
  [
    [1, 1, 1],
    [1, 0, 1],
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
    [1, 1, 1],
  ],
  // 9
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
];

const units = {
  c: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  f: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
  ],
}

const kelvinToCelsius = (kelvin: number) => kelvin - 273.15;
const kelvinToFahrenheit = (kelvin: number) => kelvin * 9 / 5 - 459.67;

const fetchWeather = async () => {
  const currentTime = Date.now();
  if (currentTime - lastFetchTime < UPDATE_FREQUENCY) { // Check if less than 10 seconds have passed
    return cachedTemperature; // Return the cached temperature
  }

  console.log('Refetching weather...');
  const LAT = 42.370970;
  const LON = -71.073720
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch weather data: ${response.statusText}`, response);
      return null;
    }

    const data = await response.json() as any;
    const temperature = Math.round(data.main.temp); // Round to nearest integer
    lastFetchTime = currentTime; // Update the last fetch time
    cachedTemperature = temperature; // Cache the temperature
    return temperature;
  } catch (error: any) {
    console.error(`Error fetching weather data: ${error.message}`);
    return null;
  }
};

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

type TextType = 'REGULAR' | 'SMALL' | 'UNITS' | 'DEGREE_SYMBOL';

const placeDigit = (
  grid: number[][][],
  digit: number | string,
  c: number,
  r: number,
  textType: TextType = 'REGULAR'
) => {
  let digitDisplay2: number[][];
  const color =
    textType === 'REGULAR' ? ON_COLOR : ON_COLOR_2;

  if (textType === 'REGULAR' || textType === 'SMALL') {
    // Handle numeric digits (0–9)
    const digitIndex = typeof digit === 'number' ? digit : parseInt(digit, 10);

    if (isNaN(digitIndex) || digitIndex < 0 || digitIndex > 9) {
      console.error(`Invalid digit for numeric text: ${digit}`);
      return;
    }

    digitDisplay2 =
      textType === 'REGULAR' ? pixelNumbers[digitIndex] : smallPixelNumbers[digitIndex];
  } else if (textType === 'DEGREE_SYMBOL') {
    digitDisplay2 = [
      [1],
    ]
  } else {
    // Handle units (e.g., 'c' or 'f')
    if (typeof digit !== 'string' || !(digit in units)) {
      console.error(`Invalid unit: ${digit}`);
      return;
    }
    digitDisplay2 = units[digit as keyof typeof units];
  }

  // Place the digit onto the grid
  for (let i = r; i < r + digitDisplay2.length; i++) {
    for (let j = c; j < c + digitDisplay2[0].length; j++) {
      grid[i][j] = digitDisplay2[i - r][j - c] === 1 ? color : [0, 0, 0];
    }
  }
};

export async function GET(request: Request) {


  // grid[0][0] = [255, 0, 0]; // Set top-left LED to red
  // grid[0][15] = [0, 255, 0]; // Set top-right LED to green
  // grid[15][0] = [0, 0, 255]; // Set bottom-left LED to blue
  // grid[15][15] = [255, 255, 255]; // Set bottom-right LED to white

  const now = new Date();


  // for every time, we want to get 4 variants:
  // 1. the time and the weather, as normal in celsius
  // 2. the time and the weather, as normal in celsius, without the : between the hour and minute
  // 3. the time and the weather, as normal in fahrenheit
  // 4. the time and the weather, as normal in fahrenheit, without the : between the hour and minute

  const buffer1 = await getBufferData(now, true, true);
  const buffer2 = await getBufferData(now, false, true);
  const buffer3 = await getBufferData(now, true, false);
  const buffer4 = await getBufferData(now, false, false);

  const buffer = new Uint8Array([...buffer1, ...buffer2, ...buffer3, ...buffer4]);

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

const getBufferData = async (
  now: Date, 
  getWithColon: boolean, 
  getWithCelsius: boolean
) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York", // Eastern Time (ET)
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const grid = clearAll(); // Clear all LEDs

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const currentETTime = formatter.format(now);
  const hourIn12HourFormat = parseInt(currentETTime.split(":")[0]);
  const minute = now.getMinutes();

  let xOffset = 0;

  if (hourIn12HourFormat >= 10) {
    const firstDigit = Math.floor(hourIn12HourFormat / 10);
    placeDigit(grid, firstDigit, -1, 1);
  } else {
    xOffset = -1;
  }

  const secondDigit = hourIn12HourFormat % 10;
  placeDigit(grid, secondDigit, 3 + xOffset, 1);
  if (getWithColon === true) {
    grid[3][7 + xOffset] = ON_COLOR;
    grid[6][7 + xOffset] = ON_COLOR;
  }

  const thirdDigit = Math.floor(minute / 10);
  placeDigit(grid, thirdDigit, 9 + xOffset, 1);
  const fourthDigit = minute % 10;
  placeDigit(grid, fourthDigit, 13 + xOffset, 1);

  const temperature = await fetchWeather(); // Fetch weather only if necessary

  if (temperature !== null) {
    const variant = getWithCelsius === true;
    const unit = variant ? 'c' : 'f';
    const displayTemperature =
      variant ?
        Math.floor(kelvinToCelsius(temperature)) :
        Math.floor(kelvinToFahrenheit(temperature));

    const toRender: { digit: number | string; x: number; y: number; type: TextType }[] = [];
    const pixelLength = displayTemperature.toString().split('').reduce((acc, digit) => {
      if (digit === '-') {
        toRender.push({
          digit,
          x: acc,
          y: 12,
          type: 'SMALL'
        });
        return acc + 3;
      } else if (digit === '1') {
        toRender.push({
          digit,
          x: acc,
          y: 9,
          type: 'SMALL'
        });
        return acc + 3;
      } else {
        toRender.push({
          digit,
          x: acc,
          y: 9,
          type: 'SMALL'
        });
        return acc + 4
      }
    }, 0);
    toRender.push({
      digit: unit,
      x: pixelLength,
      y: 9,
      type: 'DEGREE_SYMBOL'
    })
    toRender.push({
      digit: unit,
      x: pixelLength + 1,
      y: 11,
      type: 'UNITS'
    })

    const xOffset = Math.floor(Math.max((12 - pixelLength), 0) / 2 + 0.5);
    toRender.forEach(({ digit, x, y, type }) => {
      if (digit === '-') {
        grid[y][x + xOffset] = ON_COLOR_2;
        grid[y][x + 1 + xOffset] = ON_COLOR_2;
      } else {
        placeDigit(grid, digit, x + xOffset, y, type);
      }
    });
  } else {
    console.error("Failed to retrieve temperature. Skipping display.");
  }

  const buffer = convertGridToBuffer(grid);
  return buffer;
}