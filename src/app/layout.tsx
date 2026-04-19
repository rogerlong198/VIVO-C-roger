import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivo Recarga - Recarregue seu Vivo Pré ou Controle",
  description: "Recarregue seu Vivo de forma rápida, fácil e segura. Ganhe bônus de internet e fale muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
