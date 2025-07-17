import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/app/theme/theme-provider";
import KBar from "@/components/app/kbar/KBar";
import StoreWrapper from "@/components/app/store-wrapper";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Mailquark",
  description: "Email SASS with chatbot and autocomplete AI fetaures",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      {" "}
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <StoreWrapper>
                <KBar>{children}</KBar>
                <Toaster richColors />
              </StoreWrapper>
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
