import type { AppProps } from 'next/app';
import '../components/Layout/Layout.css';
import '../components/Logo/Logo.css';
import '../components/Navigation/Navigation.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
