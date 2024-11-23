// app/api/weather/route.ts

export async function GET(request: Request) {
  const gridSize = 256;

  // Helper function to generate a random RGB color
  const getRandomColor = () => ({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });

  // Create a 256x256 grid of random RGB colors
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, getRandomColor)
  );

  // Return the JSON response
  return new Response(JSON.stringify(grid), {
    headers: { 'Content-Type': 'application/json' },
  });
}