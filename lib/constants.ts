export const PRIORITIES = [
  { id: "baja", label: "Baja" },
  { id: "normal", label: "Normal" },
  { id: "alta", label: "Alta" },
] as const;

export const CONTACT_STAGES = [
  { id: "lead", label: "Lead" },
  { id: "contactado", label: "Contactado" },
  { id: "reunion", label: "Reunión" },
  { id: "propuesta", label: "Propuesta" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
] as const;

export const ACTIVITY_TYPES = [
  { id: "llamada", label: "Llamada" },
  { id: "correo", label: "Correo" },
  { id: "mensaje", label: "Mensaje" },
  { id: "reunion", label: "Reunión" },
  { id: "nota", label: "Nota" },
] as const;

export const FINANCE_CATEGORIES = [
  "Ventas",
  "Servicios",
  "Nómina",
  "Herramientas",
  "Marketing",
  "Impuestos",
  "Otros",
] as const;

export const SALES_PROJECTS = ["trabajo", "casa", "estudio"] as const;

export const DECISION_STATUSES = [
  { id: "pendiente", label: "Pendientes" },
  { id: "decidida", label: "Decididas" },
  { id: "descartada", label: "Descartadas" },
] as const;

export const SHOW_FINANCE = false;
export const SHOW_SALES = false;
