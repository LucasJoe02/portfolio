import type { Metadata } from "next";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme';

import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "Lucas Redding",
  description: "Lucas' portfolio",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
