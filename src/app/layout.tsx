import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyfora | Tavo personalinė klinika",
  description: "Lyfora — paciento ir gydytojo sveikatos platforma",
  icons: { icon: "/brand/lyfora-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body className="antialiased">{children}</body>
    </html>
  );
}
