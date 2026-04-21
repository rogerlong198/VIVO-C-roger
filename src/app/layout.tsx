import type { Metadata } from "next";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivo Recarga - Recarregue seu Vivo Pré ou Controle",
  description: "Recarregue seu Vivo de forma rápida, fácil e segura. Ganhe bônus de internet e fale muito mais.",
  icons: {
    icon: "/icon-app-vivo.png",
    shortcut: "/icon-app-vivo.png",
    apple: "/icon-app-vivo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18036805764"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'AW-18036805764');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
