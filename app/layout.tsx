import 'styles/globals.scss';
import 'styles/highlight.scss';
import { Inter, Montserrat, Ubuntu_Mono } from '@next/font/google';
import Navbar from './navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const ubuntuMono = Ubuntu_Mono({
  subsets: ['latin'],
  variable: '--font-ubuntu-mono',
  weight: ['400'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${ubuntuMono.variable}`}>
      <body>
        <div className={'container'}>
          <Navbar />
          <div className={'content'}>{children}</div>
        </div>
      </body>
    </html>
  );
}
