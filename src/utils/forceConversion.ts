export interface ForceUnits {
  newtons: number;
  pounds: number;
  kilograms: number;
}

export function convertForce(newtons: number): ForceUnits {
  return {
    newtons,
    pounds: newtons * 0.224809,
    kilograms: newtons * 0.101972,
  };
}