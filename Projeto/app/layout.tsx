import 'bootstrap/dist/css/bootstrap.min.css';
import { Outfit } from 'next/font/google';
import "./globals.css";

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: "Banco de Ração - Votorantim",
  description: "Sistema de Gestão do Bem-Estar Animal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={outfit.className}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}