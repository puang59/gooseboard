import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "gooseBoard",
  description: "a real-time canvas for drawing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} bg-gray-200 text-black`}
      >
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}
