import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                // Decodifica o token para pegar o ID
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;

                // Define o token no cabeçalho do 'api'
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                api.get(`/usuarios/${userId}`)
                    .then(res => {
                        setUser({ id: res.data.id, usunome: res.data.usunome, usufoto: res.data.usufoto });
                    })
                    .catch(err => {
                        console.error("Erro ao buscar usuário com token:", err);
                        localStorage.removeItem('accessToken');
                        delete api.defaults.headers.common['Authorization'];
                    })
                    .finally(() => {
                        setLoading(false);
                    });

            } catch (e) {
                console.error("Token inválido.", e);
                localStorage.removeItem('accessToken');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        try {
            // Salva o token no localStorage
            localStorage.setItem('accessToken', token);

            setUser({ id: userData.id, usunome: userData.usunome });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            router.push("/inicial");
        } catch (e) {
            console.error("Erro ao fazer login:", e);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    return useContext(AuthContext);
};