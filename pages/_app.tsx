import type { AppProps } from 'next/app';
import '../components/layout.css';
import '../components/Logo/logo.css';
import '../components/Navigation/navigation.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
