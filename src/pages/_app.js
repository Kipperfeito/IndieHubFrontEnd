import "@/styles/globals.css";
import HeaderLog from '@/components/HeaderLog';
import Header from '@/components/Header';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  const mostrarHeader = !Component.noHeader;
  return (
    <>
      {mostrarHeader && (
        user ? <HeaderLog /> : <Header />
      )}
        <Component {...pageProps} />
    </>
  );
}
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* O AppContent (que tem a lógica do Header) é renderizado aqui,
          dentro do provider. */}
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}