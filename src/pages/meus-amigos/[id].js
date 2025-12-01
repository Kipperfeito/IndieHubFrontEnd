import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './meusAmigos.module.css'; 

// Ícones
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatarImage} />;
    }
    return (
        <div className={styles.avatarFallback}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};
export default function MeusAmigos() {
    const { user } = useAuth();
    const [amigos, setAmigos] = useState([]);
    const [pendentes, setPendentes] = useState([]);
    const [loading, setLoading] = useState(true);

    const carregarTudo = () => {
        if (!user) return;
        setLoading(true);

        const reqAmigos = api.get('/amizades'); 
        const reqPendentes = api.get('/amizades/pendentes');

        Promise.all([reqAmigos, reqPendentes])
            .then(([resAmigos, resPendentes]) => {
                setAmigos(resAmigos.data);
                setPendentes(resPendentes.data);
            })
            .catch(err => console.error("Erro ao carregar amigos", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        carregarTudo();
    }, [user]);

    const handleAceitar = (idSolicitante) => {
        api.put('/amizades/aceitar', { idDoAmigo: idSolicitante })
            .then(() => {
                alert("Amizade aceita!");
                carregarTudo(); 
            })
            .catch(err => alert("Erro ao aceitar."));
    };

    const handleRejeitar = (idSolicitante) => {
        if (!confirm("Rejeitar esta solicitação?")) return;
        api.delete(`/amizades/${idSolicitante}`)
            .then(() => carregarTudo())
            .catch(err => alert("Erro ao rejeitar."));
    };

    const handleRemoverAmigo = (idAmigo) => {
        if (!confirm("Tem certeza que quer desfazer esta amizade?")) return;
        api.delete(`/amizades/${idAmigo}`)
            .then(() => carregarTudo())
            .catch(err => alert("Erro ao remover amigo."));
    };

    if (loading) return <div className={styles.container}><p>Carregando social...</p></div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Social</h1>

            <h2>Solicitações Pendentes <span className={styles.badge}>{pendentes.length}</span></h2>
            {pendentes.length > 0 ? (
                <section className={styles.section}>
                    <div className={styles.grid}>
                        {pendentes.map(req => (
                            <div key={req.id} className={styles.cardPendente}>
                                <div className={styles.userInfo}>
                                    {req.solicitante && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <Avatar usufoto={req.solicitante.usufoto} usunome={req.solicitante.usunome} />
                                            <span><strong>{req.solicitante.usunome}</strong> quer ser seu amigo.</span>
                                        </div>
                                    )}
                                    {!req.solicitante && <span>Solicitação ID: {req.usuarioId}</span>}
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => handleAceitar(req.usuarioId)} className={styles.btnAccept} title="Aceitar">
                                        <CheckIcon />
                                    </button>
                                    <button onClick={() => handleRejeitar(req.usuarioId)} className={styles.btnReject} title="Rejeitar">
                                        <XIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (<p className={styles.empty}>Você não tem nenhuma solicitação.</p>)}

            {/* SEÇÃO DE AMIGOS */}
            <section className={styles.section}>
                <h2>Meus Amigos ({amigos.length})</h2>
                {amigos.length === 0 ? (
                    <p className={styles.empty}>Você ainda não adicionou ninguém.</p>
                ) : (
                    <div className={styles.grid}>
                        {amigos.map(amigo => (
                            <div key={amigo.id} className={styles.friendCard}>
                                <Link href={`/perfil/${amigo.id}`} className={styles.friendLink}>
                                    <Avatar usufoto={amigo.usufoto} usunome={amigo.usunome}/>
                                    <div>
                                        <strong>{amigo.usunome}</strong>
                                        <span className={styles.status}>{amigo.usudisponibilidade || "Disponível"}</span>
                                    </div>
                                </Link>
                                <button onClick={() => handleRemoverAmigo(amigo.id)} className={styles.btnRemove} title="Desfazer amizade">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}