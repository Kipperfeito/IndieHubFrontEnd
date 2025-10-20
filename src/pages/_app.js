import "@/styles/globals.css";
import Header from '@/components/HeaderLog';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
