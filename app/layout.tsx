import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { ThemeBoot } from "@/components/ThemeBoot";
import "./globals.css";

const ui = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "HQ",
    template: "%s · HQ",
  },
  description: "Panel personal para el día.",
  applicationName: "HQ",
  appleWebApp: {
    capable: true,
    title: "HQ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c1410",
};

const motionBoot = `
try {
  var raw = localStorage.getItem("hq-ui");
  var motion = true;
  if (raw) {
    var parsed = JSON.parse(raw);
    if (parsed && parsed.state && typeof parsed.state.motion === "boolean") {
      motion = parsed.state.motion;
    }
  } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    motion = false;
  }
  document.documentElement.dataset.motion = motion ? "on" : "off";
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${ui.variable} ${display.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body className="min-h-full antialiased">
        <ThemeBoot />
        <PwaRegister />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
