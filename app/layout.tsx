import type { Metadata } from 'next';
import './globals.css';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { CSPostHogProvider } from '@/components/PostHogProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Slobi - One Link for Everything You Are',
  description:
    'Create a beautiful, personalized page to showcase your content, sell digital products, and grow your audience.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={notoSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Chewy&display=swap" rel="stylesheet" />
      </head>
      <body className='chewy-regular antialiased'>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConvexClientProvider>
            <CSPostHogProvider>
              {children}
              <Toaster richColors position="top-center" />
            </CSPostHogProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
