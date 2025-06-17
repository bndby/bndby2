import type { AppProps } from 'next/app';
import '../components/layout.css';
import '../components/logo.css';
import '../components/navigation.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
