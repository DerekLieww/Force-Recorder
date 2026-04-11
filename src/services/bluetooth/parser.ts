export function parseTindeqData(dataView: DataView): number {
  const weight = dataView.getFloat32(2, true);
  const force = Math.round(weight * 22.04) / 10;
  return Math.max(force, 0);
}