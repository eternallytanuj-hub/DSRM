import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "./AppContext";
import { Web3Provider } from "@/components/Web3Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSRM // ORBITAL ACCESS EXCHANGE",
  description: "DSRM Orbital Access Exchange",
};

const tailwindConfigStr = `tailwind.config={darkMode:"class",theme:{extend:{"colors":{"on-tertiary":"#3c0091","background":"#11131c","status-nominal-surface":"rgba(6, 78, 59, 0.2)","text-tertiary":"#5A6275","secondary-fixed":"#6ffbbe","text-secondary":"#9BA3B8","outline":"#8c909f","inverse-surface":"#e1e1ef","surface-container-low":"#191b25","error-container":"#93000a","inverse-on-surface":"#2e303a","surface-panel":"#0D0F18","tertiary-fixed":"#e9ddff","surface-container-lowest":"#0c0e17","on-primary-fixed-variant":"#004395","status-pending":"#F59E0B","surface-container-high":"#282933","border-active":"#384259","surface-dim":"#11131c","on-secondary-container":"#00311f","secondary":"#4edea3","canvas-base":"#07080C","status-pending-surface":"rgba(120, 53, 15, 0.2)","surface-inset":"#131622","primary":"#adc6ff","on-tertiary-container":"#340080","surface-tint":"#adc6ff","status-active":"#3B82F6","primary-container":"#4d8eff","border-default":"#1F2433","on-primary":"#002e6a","on-background":"#e1e1ef","tertiary-container":"#a078ff","inverse-primary":"#005ac2","on-tertiary-fixed":"#23005c","on-secondary-fixed":"#002113","status-nominal":"#10B981","tertiary":"#d0bcff","error":"#ffb4ab","surface":"#11131c","status-active-surface":"rgba(30, 58, 138, 0.2)","primary-fixed-dim":"#adc6ff","on-primary-container":"#00285d","on-error-container":"#ffdad6","on-surface":"#e1e1ef","surface-bright":"#373943","status-breach":"#EF4444","hash-spectral":"#8B5CF6","secondary-fixed-dim":"#4edea3","text-primary":"F0F3F8","on-secondary":"#003824","on-error":"#690005","surface-container":"#1d1f29","on-tertiary-fixed-variant":"#5516be","surface-container-highest":"#32343e","secondary-container":"#00a572","on-secondary-fixed-variant":"#005236","status-breach-surface":"rgba(127, 29, 29, 0.2)","tertiary-fixed-dim":"#d0bcff","outline-variant":"#424754","primary-fixed":"#d8e2ff","on-primary-fixed":"#001a42","surface-variant":"#32343e","on-surface-variant":"#c2c6d6"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"margin-desktop":"1rem","space-lg":"0.75rem","space-md":"0.5rem","space-xs":"0.25rem","space-sm":"0.375rem","gutter":"0.5rem","space-xl":"1rem","margin":"0.5rem","gutter-desktop":"0.75rem"},"fontFamily":{"body-lg":["Inter"],"headline-md":["Inter"],"body-sm":["Inter"],"label-sm":["JetBrains Mono"],"body-md":["Inter"],"code-md":["JetBrains Mono"],"label-lg":["JetBrains Mono"],"headline-sm":["Inter"],"label-md":["JetBrains Mono"],"headline-lg":["Inter"],"code-sm":["JetBrains Mono"]},"fontSize":{"body-lg":["14px",{"lineHeight":"20px","fontWeight":"400"}],"headline-md":["16px",{"lineHeight":"24px","letterSpacing":"-0.005em","fontWeight":"600"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"label-sm":["10px",{"lineHeight":"14px","letterSpacing":"0.05em","fontWeight":"500"}],"body-md":["13px",{"lineHeight":"18px","fontWeight":"400"}],"code-md":["12px",{"lineHeight":"16px","fontWeight":"400"}],"label-lg":["13px",{"lineHeight":"18px","fontWeight":"500"}],"headline-sm":["14px",{"lineHeight":"20px","fontWeight":"600"}],"label-md":["11px",{"lineHeight":"16px","letterSpacing":"0.03em","fontWeight":"500"}],"headline-lg":["20px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"code-sm":["11px",{"lineHeight":"14px","fontWeight":"400"}]}}}}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <script dangerouslySetInnerHTML={{ __html: tailwindConfigStr }}></script>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-canvas-base text-text-primary font-body-md text-body-md select-none">
        <AppProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </AppProvider>
      </body>
    </html>
  );
}
