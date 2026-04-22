/**
 * [INPUT]:  Google Fonts for home page
 * [OUTPUT]: Layout wrapper with custom fonts
 * [POS]:    /home route layout
 * [PROTOCOL]: Update this header on any change
 */

import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      {children}
    </div>
  );
}
