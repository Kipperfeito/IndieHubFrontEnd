import "@/styles/globals.css";
import HeaderLog from '@/components/HeaderLog';
import Header from '@/components/Header';
import { AuthProvider, userAuth } from '@/context/AuthContext';

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Ou um spinner/tela de loading global
  }
  return (
    <>
      {user ? <HeaderLog /> : <Header />}
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}
export default function AppContent({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* O AppContent (que tem a lógica do Header) é renderizado aqui,
          dentro do provider. */}
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}