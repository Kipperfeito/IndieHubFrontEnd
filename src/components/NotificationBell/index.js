import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import styles from './notificationBell.module.css';
import Link from 'next/link';

// Ícone de Sino
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function NotificationBell() {
    const { user } = useAuth();
    const [notificacoes, setNotificacoes] = useState([]);
    const [aberto, setAberto] = useState(false);
    const [naoLidas, setNaoLidas] = useState(0);

    const carregarNotificacoes = () => {
        if (!user) return;
        api.get('/notificacoes').then(res => {
            setNotificacoes(res.data);
            setNaoLidas(res.data.filter(n => !n.lida).length);
        });
    };

    const handleDeleteNotificacao = (e, id) => {
        e.stopPropagation(); // Impede que clique no link (não navega)
        e.preventDefault();  // Prevenção extra

        setNotificacoes(prev => prev.filter(n => n.id !== id));

        const notif = notificacoes.find(n => n.id === id);
        if (notif && !notif.lida) {
            setNaoLidas(prev => Math.max(0, prev - 1));
        }

        api.delete(`/notificacoes/${id}`).catch(err => console.error("Erro ao deletar notif", err));
    };
    const handleDeleteTodasNotificacao = (e) => {
        e.stopPropagation(); // Impede que clique no link (não navega)
        e.preventDefault();  // Prevenção extra
        if (confirm("Tem certeza que quer deletar todas notificações?")){
                // Chama a API em segundo plano
               api.delete('/notificacoes/limpar') 
                .then(() => {
                    setNotificacoes([]);
                    setNaoLidas(0);
                })
                .catch(err => console.error(err));
            }
        };
    // Carrega ao iniciar e a cada 30 segundos (polling simples)
    useEffect(() => {
        carregarNotificacoes();
        const intervalo = setInterval(carregarNotificacoes, 30000);
        return () => clearInterval(intervalo);
    }, [user]);

    const handleOpen = () => {
        setAberto(!aberto);
        if (!aberto && naoLidas > 0) {
            // Marca todas como lidas visualmente (opcional: chamar API para marcar todas)
            // Para simplificar, marca individualmente ao clicar no link
        }
    };

    const handleClickNotificacao = (id, link) => {
        api.put(`/notificacoes/${id}/lida`).then(() => {
            setNotificacoes(prev => prev.map(n => n.id === id ? {...n, lida: true} : n));
            setNaoLidas(prev => Math.max(0, prev - 1));
        });
        setAberto(false);
        // O Link do Next.js já fará a navegação
    };

    if (!user) return null;

    return (
        <div className={styles.container}>
            
            <button onClick={handleOpen} className={styles.bellButton}>
                <BellIcon />
                {naoLidas > 0 && <span className={styles.badge}>{naoLidas}</span>}
            </button>

            {aberto && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h4>Notificações</h4>
                        <button className={styles.clearAll} onClick={(e) => handleDeleteTodasNotificacao(e)}>Limpar</button>
                    </div>  
                    {notificacoes.length === 0 ? (
                        <p className={styles.empty}>Nenhuma notificação.</p>
                    ) : (
                        <ul className={styles.list}>
                            {notificacoes.map(notif => (
                                <li key={notif.id} className={`${styles.item} ${!notif.lida ? styles.naoLida : ''}`}>
                                    <Link 
                                        href={notif.link || '#'} 
                                        onClick={() => handleClickNotificacao(notif.id)}
                                        className={styles.link}
                                    >
                                        <p>{notif.conteudo}</p>
                                        <span className={styles.date}>
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </Link>
                                    <button 
                                        className={styles.deleteBtn}
                                        onClick={(e) => handleDeleteNotificacao(e, notif.id)}
                                        title="Remover notificação"
                                    >
                                        <TrashIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}