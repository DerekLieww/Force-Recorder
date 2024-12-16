// Convert raw ADC value to Newtons based on Tindeq's formula
export function calculateForce(rawValue: number): number {
  // Formula from Tindeq documentation
  const force = (rawValue - 8388608) / 1864.0;
  return Math.max(0, force); // Ensure non-negative force values
}

export function detectPlateau(readings: number[], timeWindow: number = 500, varianceThreshold: number = 1): boolean {
  if (readings.length < 10) return false;

  const recentReadings = readings.slice(-10);
  const mean = recentReadings.reduce((a, b) => a + b, 0) / recentReadings.length;
  const variance = recentReadings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentReadings.length;

  return variance < varianceThreshold && mean > 2; // 2N minimum threshold
}