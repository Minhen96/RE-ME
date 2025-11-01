  import type { Metadata } from 'next';
  import './globals.css';

  export const metadata: Metadata = {
    title: 'RE:ME - Your Self-Growth Journey',
    description: 'A private, calm self-growth web app with AI-driven insights',
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