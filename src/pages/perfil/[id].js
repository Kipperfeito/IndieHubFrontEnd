import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './Perfil.module.css';
import cardStyles from '@/pages/meus-projetos/meus.module.css';

const AddFriendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const FriendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>;
const AcceptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatarImage} />;
    }
    // Fallback estilo WhatsApp
    return (
        <div className={styles.avatarFallback}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};

const ProjectCard = ({ projeto }) => {
    const formatarData = (dataString) => {
        if (!dataString) return "N/A";
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const vagas = (projeto.vagas);

    return (
        <Link href={`/tela-proj/${projeto.id}`} className={cardStyles.cardLink}>
            <div className={cardStyles.card}>
                <div>
                    <h3>{projeto.projtitulo}</h3>
                    <p className={cardStyles.descricao}>
                        {projeto.projdesc ? `${projeto.projdesc.substring(0, 100)}...` : "Sem descrição."}
                    </p>
                    <div className={cardStyles.metaData}>
                        <span><strong>Publicado em:</strong> {formatarData(projeto.projdatapublicacao)}</span>
                        {vagas.length > 0 && <span><strong>Vagas:</strong> {vagas.length}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default function PerfilPublico() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth(); // Usuário logado

    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [friendStatus, setFriendStatus] = useState('none'); 

    useEffect(() => {
        if (id) {
            setLoading(true);
            // Busca o usuário pelo ID da URL, incluindo suas associações
            api.get(`/usuarios/${id}`)
                .then(res => {
                    const data = res.data;
                    console.log("DADOS RECEBIDOS DO PERFIL:", data);
                    try { data.usutags = JSON.parse(data.usutags) || []; } catch (e) { data.usutags = []; }
                    try { data.usuproficiencia = JSON.parse(data.usuproficiencia) || {}; } catch (e) { data.usuproficiencia = {}; }
                    
                    setPerfil(data);
                })
                .catch(err => {
                    console.error(err);
                    setError("Usuário não encontrado.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    useEffect(() => {
        if (user && id && user.id !== parseInt(id)) {
            api.get(`/amizades/status/${id}`)
                .then(res => {
                        console.log("Status recebido da API:", res.data.status); 
                        setFriendStatus(res.data.status || 'none');
                })
                .catch(err => {
                    console.error("Erro ao verificar amizade:", err);
                    setFriendStatus('none');
                });;
        }
    }, [user, id]);

    const handleAddFriend = () => {
        if (!user) {
            alert("Faça login para adicionar amigos!");
            return;
        }
        setFriendStatus('loading');
        
        api.post('/amizades/solicitar', { amigoId: perfil.id })
            .then(() => {
                setFriendStatus('pendente');
                alert("Solicitação de amizade enviada!");
            })
            .catch(err => {
                console.error(err);
                setFriendStatus('none'); // Reverte em caso de erro
                alert(err.response?.data?.message || "Erro ao adicionar amigo.");
            });
    };
    const handleCancelRequest = () => {
        if (!confirm("Deseja cancelar a solicitação de amizade?")) return;
        setFriendStatus('loading');

        api.delete(`/amizades/${perfil.id}`)
            .then(() => {
                setFriendStatus('none'); 
            })
            .catch(err => {
                console.error(err);
                setFriendStatus('pendente'); 
                alert("Erro ao cancelar.");
            });
    };
    
    const handleAcceptFriend = () => {
        setFriendStatus('loading');

        api.put('/amizades/aceitar', { idDoAmigo: perfil.id })
            .then(() => {
                setFriendStatus('aceito');
                alert("Agora vocês são amigos!");
            })
            .catch(err => {
                console.error("Erro ao aceitar:", err);
                setFriendStatus('recebido');
                alert("Erro ao aceitar solicitação.");
            });
    };

    const handleOpenChat = () => {
        router.push(`/chat?amigoId=${perfil.id}`);
    };

    if (loading || authLoading) {
        return <div className={styles.container}><p>Carregando perfil...</p></div>;
    }

    if (error) {
        return <div className={styles.container}><p>{error}</p></div>;
    }
    
    if (!perfil) {
        return <div className={styles.container}><p>Perfil não encontrado.</p></div>;
    }

    // Verifica se o usuário logado é o dono deste perfil
    const isOwner = user && user.id === perfil.id;

    const projetosOwned = perfil.projetos || [];
    const projetosCollab = perfil.projetosColaborando || [];
    
    const projectMap = new Map();
    [...projetosOwned, ...projetosCollab].forEach(p => projectMap.set(p.id, p));
    const projetosUnicos = Array.from(projectMap.values());


    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <Avatar usufoto={perfil.usufoto} usunome={perfil.usunome} />
                    <div className={styles.profileInfo}>
                        <h1>{perfil.usunome}</h1>
                        <p>disponibilidade: {perfil.usudisponibilidade || "Disponibilidade não informada"}</p>
                    </div>
                    <div className={styles.profileActions}>
                        {isOwner ? (
                            <Link href={`/editar-perfil/${user.id}`} className={styles.editButton}>
                                Editar Perfil
                            </Link>
                        ) : (
                            <>
                                {(friendStatus === 'none' || !['pendente', 'aceito', 'recebido', 'loading'].includes(friendStatus)) && (
                                    <button className={`${styles.friendButton} ${styles.none}`} onClick={handleAddFriend}>
                                        <AddFriendIcon /> Adicionar Amigo
                                    </button>
                                )}
                                {friendStatus === 'pendente' && (
                                    <button 
                                        className={`${styles.friendButton} ${styles.pendente}`} 
                                        onClick={handleCancelRequest}
                                        title="Clique para cancelar a solicitação"
                                    >
                                        <CancelIcon /> Cancelar Solicitação
                                    </button>
                                )}
                                {friendStatus === 'recebido' && (
                                    <button 
                                        className={`${styles.friendButton} ${styles.aceito}`}
                                        onClick={handleAcceptFriend}
                                        style={{ cursor: 'pointer' }} 
                                    >
                                        <AcceptIcon /> Aceitar Solicitação
                                    </button>
                                )}
                                {friendStatus === 'aceito' && (
                                    <button 
                                        className={`${styles.friendButton} ${styles.aceito}`} 
                                        onClick={handleOpenChat} // Chama a função de abrir chat
                                        title="Conversar"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <ChatIcon /> Conversar
                                    </button>
                                )}
                                {friendStatus === 'loading' && (
                                    <button className={styles.friendButton} disabled>
                                        ...
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {perfil.usutags.length > 0 && (
                    <section className={styles.profileSection}>
                        <h2>Habilidades</h2>
                        <div className={styles.tagList}>
                            {perfil.usutags.map(tag => (
                                <span key={tag} className={styles.tagReadOnly}>
                                    {tag}
                                    {perfil.usuproficiencia[tag] && (
                                        <em> ({perfil.usuproficiencia[tag]})</em>
                                    )}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {perfil.usuportifolio && (
                    <section className={styles.profileSection}>
                        <h2>Portfólio</h2>
                        <a href={perfil.usuportifolio} target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>
                            {perfil.usuportifolio}
                        </a>
                    </section>
                )}
            </div>

            <div className={styles.profileCard}>
                <h2 className={styles.sectionTitle}>Projetos</h2>
                <div className={cardStyles.galleryContainer}>
                    {projetosUnicos.length > 0 ? (
                        projetosUnicos.map(projeto => (
                            <ProjectCard key={projeto.id} projeto={projeto} />
                        ))
                    ) : (
                        <p>Este usuário ainda não está participando de nenhum projeto.</p>
                    )}
                </div>
            </div>
        </div>
    );
}