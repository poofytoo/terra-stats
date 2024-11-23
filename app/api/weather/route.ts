export const runtime = 'nodejs'; // Specify the runtime explicitly
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false

export async function GET(request: Request) {
  const gridSize = 16 * 16;
  const buffer = Buffer.alloc(gridSize * 3); // Allocate buffer for 768 bytes

  // Fill buffer with random RGB values
  for (let i = 0; i < gridSize; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    buffer[i * 3] = r;     // Red
    buffer[i * 3 + 1] = g; // Green
    buffer[i * 3 + 2] = b; // Blue
  }

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