import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from '@/lib/user_context';

export const metadata: Metadata = {
  title: "News Map",
  description: "News Map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body id="root">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
