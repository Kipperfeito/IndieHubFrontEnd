import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import styles from "@/styles/Form.module.css";

export default function Login() {
    const [usuemail, setEmail] = useState('');
    const [ususenha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    
    // Pega a função 'login' do contexto
    const { login } = useAuth(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');

        if (!usuemail || !ususenha) {
            setErro("Preencha email e senha.");
            return;
        }

        api.post("/usuarios/login", { usuemail, ususenha })
            .then(res => {
                const token = res.data.accessToken;
                const userData = res.data.usuario; 

                // 3. Passa AMBOS para a função de login do contexto
                login(token, userData); 
                
                // --- FIM DA MUDANÇA ---
            })
            .catch(err => {
                console.error(err);
                const msg = err.response?.data?.message || "Erro ao tentar logar.";
                setErro(msg);
            });
    };

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.container} style={{ maxWidth: '420px', margin: '0' }}>
                <form onSubmit={handleSubmit} className={styles.formCadastro}>
                    <h3>Login</h3>
                    
                    {erro && <p className={styles.erro}>{erro}</p>}

                    <label htmlFor="usuemail">Email: </label>
                    <input 
                        type="email" 
                        id="usuemail" 
                        value={usuemail}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <label htmlFor="ususenha">Senha: </label>
                    <input 
                        type="password" 
                        id="ususenha" 
                        value={ususenha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <br />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}