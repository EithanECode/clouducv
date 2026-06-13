import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Cloud UCV',
  description: 'App universitaria de eventos Cloud UCV',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
