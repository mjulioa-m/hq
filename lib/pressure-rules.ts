export const PRESSURE_LIMITS = {
  systolic: { min: 60, max: 260 },
  diastolic: { min: 40, max: 160 },
  pulse: { min: 30, max: 220 },
} as const;

const RANGE_MESSAGE = {
  systolic: "La sistólica va entre 60 y 260.",
  diastolic: "La diastólica va entre 40 y 160.",
  pulse: "El pulso va entre 30 y 220.",
} as const;

export function pressureFieldError(field: "systolic" | "diastolic" | "pulse", raw: string): string | null {
  const value = raw.trim();
  if (value === "") {
    if (field === "systolic") return "Escribe la sistólica.";
    if (field === "diastolic") return "Escribe la diastólica.";
    return null;
  }
  if (!/^\d+$/.test(value)) return RANGE_MESSAGE[field];
  const number = Number(value);
  const limits = PRESSURE_LIMITS[field];
  if (number < limits.min || number > limits.max) return RANGE_MESSAGE[field];
  return null;
}

export function pressurePairError(systolic: number, diastolic: number): string | null {
  if (systolic <= diastolic) return "La sistólica tiene que ser mayor que la diastólica.";
  return null;
}
