import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RE:ME - Your Self-Growth Journey',
  description: 'A private, calm self-growth web app with AI-driven insights',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'RE:ME - Your Self-Growth Journey',
    description: 'A private, calm self-growth web app with AI-driven insights',
    url: 'https://yourapp.com', // Update this with your actual URL
    siteName: 'RE:ME',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RE:ME - Your Self-Growth Journey',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RE:ME - Your Self-Growth Journey',
    description: 'A private, calm self-growth web app with AI-driven insights',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
