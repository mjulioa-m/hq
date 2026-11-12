export type Ambient = "fireflies" | "rain" | "dust" | "ripples" | "leaves" | "stars" | "none";

export type Scene = {
  slug: string;
  title: string;
  image: string;
  still: string;
  pixelated: boolean;
  fallbackGradient: string;
  ambient: Ambient;
};

// Ilustraciones a sangre. La pausa usa el fotograma quieto.

export const SCENES: Scene[] = [
  {
    slug: "inicio",
    title: "Inicio",
    image: "/scenes/inicio.webp",
    still: "/scenes/inicio-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #3a2418 0%, #1a120e 45%, #0c0a09 100%)",
    ambient: "dust",
  },
  {
    slug: "tareas",
    title: "Tareas",
    image: "/scenes/tareas.webp",
    still: "/scenes/tareas-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #4a2a1c 0%, #1c120e 50%, #0c0a09 100%)",
    ambient: "dust",
  },
  {
    slug: "contenido",
    title: "Contenido",
    image: "/scenes/contenido.webp",
    still: "/scenes/contenido-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #14352c 0%, #0d1c18 50%, #07110e 100%)",
    ambient: "ripples",
  },
  {
    slug: "proyectos",
    title: "Proyectos",
    image: "/scenes/proyectos.webp",
    still: "/scenes/proyectos-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #2a241c 0%, #14110e 55%, #0c0a09 100%)",
    ambient: "dust",
  },
  {
    slug: "factin",
    title: "Trabajo",
    image: "/scenes/factin.webp",
    still: "/scenes/factin-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #1a2740 0%, #10151f 50%, #0b0d12 100%)",
    ambient: "stars",
  },
  {
    slug: "marie",
    title: "Casa",
    image: "/scenes/marie.webp",
    still: "/scenes/marie-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #3a2a32 0%, #1c1418 50%, #100c0e 100%)",
    ambient: "dust",
  },
  {
    slug: "boston-990",
    title: "Estudio",
    image: "/scenes/boston-990.webp",
    still: "/scenes/boston-990-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #3a2c22 0%, #1a1410 50%, #0c0a09 100%)",
    ambient: "dust",
  },
  {
    slug: "ventas",
    title: "Ventas",
    image: "/scenes/ventas.webp",
    still: "/scenes/ventas-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #1a3324 0%, #0e1a14 50%, #08110c 100%)",
    ambient: "fireflies",
  },
  {
    slug: "finanzas",
    title: "Finanzas",
    image: "/scenes/finanzas.webp",
    still: "/scenes/finanzas-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #243044 0%, #141820 50%, #0c0e12 100%)",
    ambient: "rain",
  },
  {
    slug: "decidir",
    title: "Decidir",
    image: "/scenes/decidir.webp",
    still: "/scenes/decidir-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #1e2a22 0%, #121814 50%, #0c100e 100%)",
    ambient: "leaves",
  },
  {
    slug: "aprendido",
    title: "Aprendido",
    image: "/scenes/aprendido.webp",
    still: "/scenes/aprendido-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(160deg, #2c2418 0%, #16120e 50%, #0c0a09 100%)",
    ambient: "dust",
  },
  {
    slug: "login",
    title: "Entrar",
    image: "/scenes/login.webp",
    still: "/scenes/login-still.webp",
    pixelated: false,
    fallbackGradient: "linear-gradient(180deg, #1a2438 0%, #10141c 40%, #0c0a09 100%)",
    ambient: "stars",
  },
];

export function getScene(slug: string): Scene {
  return SCENES.find((s) => s.slug === slug) ?? SCENES[0];
}

export function sceneForPath(pathname: string, override: string | null): string {
  if (pathname === "/" && override) return override;
  if (pathname === "/") return "inicio";
  if (pathname.startsWith("/tareas") || pathname.startsWith("/diario")) return "tareas";
  if (pathname.startsWith("/proyectos/")) {
    const slug = pathname.split("/")[2];
    if (["factin", "marie", "boston-990", "personal"].includes(slug)) {
      return slug === "personal" ? "aprendido" : slug;
    }
    return "proyectos";
  }
  if (pathname.startsWith("/proyectos")) return "proyectos";
  if (pathname.startsWith("/contenido")) return "contenido";
  if (pathname.startsWith("/ventas")) return "ventas";
  if (pathname.startsWith("/finanzas")) return "finanzas";
  if (pathname.startsWith("/recordatorios") || pathname.startsWith("/presion")) return "login";
  if (pathname.startsWith("/decidir")) return "decidir";
  if (pathname.startsWith("/aprendido") || pathname.startsWith("/skills")) return "aprendido";
  return "inicio";
}
