import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroMenu | Restaurant macros in seconds",
  description: "Build meals from your favorite restaurants and calculate calories, protein, carbs, and fat instantly.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
