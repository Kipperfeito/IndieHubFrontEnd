import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Efeito para carregar o usuário ao iniciar a app
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                // Decodifica o token para pegar o ID
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;

                // Define o token no cabeçalho do 'api'
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // --- MUDANÇA AQUI ---
                // Agora, usamos o ID para buscar os dados frescos do usuário
                // (Isso usa sua rota 'exports.findOne'!)
                api.get(`/usuarios/${userId}`)
                    .then(res => {
                        // Salva os dados do usuário no estado
                        setUser({ id: res.data.id, usunome: res.data.usunome });
                    })
                    .catch(err => {
                        // Se o token for válido mas o usuário não existir (ex: deletado)
                        console.error("Erro ao buscar usuário com token:", err);
                        // Limpa o token inválido
                        localStorage.removeItem('accessToken');
                        delete api.defaults.headers.common['Authorization'];
                    })
                    .finally(() => {
                        setLoading(false);
                    });
                // --- FIM DA MUDANÇA ---

            } catch (e) {
                // Se o token for inválido (expirado, etc)
                console.error("Token inválido.", e);
                localStorage.removeItem('accessToken');
                setLoading(false);
            }
        } else {
            // Nenhum token encontrado
            setLoading(false);
        }
    }, []); // Executa apenas uma vez na inicialização

    // Função de Login - AGORA ACEITA 'userData'
    const login = (token, userData) => {
        try {
            // Salva o token no localStorage
            localStorage.setItem('accessToken', token);
            
            // --- MUDANÇA AQUI ---
            // Não precisamos decodificar, já temos os dados!
            setUser({ id: userData.id, usunome: userData.usunome });
            // --- FIM DA MUDANÇA ---

            // Define o token no cabeçalho do 'api'
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Redireciona para a página inicial
            router.push("/inicial"); // ou para onde você quiser
        } catch (e) {
            console.error("Erro ao fazer login:", e);
        }
    };

    // Função de Logout (continua igual)
    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Hook customizado (continua igual)
export const useAuth = () => {
    return useContext(AuthContext);
};