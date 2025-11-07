import { useState } from 'react';
import api from '@/services/api';
import styles from "@/styles/Form.module.css";
import Link from 'next/link';

export default function EsqueciSenha() {
    const [usuemail, setEmail] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (!usuemail) {
            setErro("Por favor, insira seu e-mail.");
            return;
        }

        // Esta é a Rota 1 do Backend que você precisará criar
        api.post("/usuarios/esqueci-senha", { usuemail })
            .then(res => {
                setSucesso(res.data.message);
            })
            .catch(err => {
                const msg = err.response?.data?.message || "Erro ao enviar e-mail.";
                setErro(msg);
            });
    };

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.container} style={{ maxWidth: '420px', margin: '0' }}>
                <form onSubmit={handleSubmit} className={styles.formCadastro}>
                    <h3>Redefinir Senha</h3>
                    
                    {/* Mostra SÓ UMA das mensagens (sucesso ou erro) */}
                    {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
                    {erro && <p className={styles.erro}>{erro}</p>}

                    {/* Se deu certo, esconde o formulário */}
                    {!sucesso && (
                        <>
                            <p style={{ textAlign: 'center', color: '#ccc' }}>
                                Digite seu e-mail e enviaremos um link para redefinir sua senha.
                            </p>

                            <label htmlFor="usuemail">Email: </label>
                            <input 
                                type="email" 
                                id="usuemail" 
                                value={usuemail}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <br />
                            <button type="submit">Enviar</button>
                        </>
                    )}

                    <Link href="/login" className={styles.forgotPasswordLink}>
                        Voltar para o Login
                    </Link>
                </form>
            </div>
        </div>
    );
}
