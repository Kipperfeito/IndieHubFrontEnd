import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Importa os dois arquivos CSS: um para o layout do perfil, outro para os cards
import styles from './Perfil.module.css';
import cardStyles from '@/pages/meus-projetos/meus.module.css';

// Componente simples para o Avatar (com fallback)
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

// Componente simples para o Card de Projeto (copiado de 'meus-projetos')
const ProjectCard = ({ projeto }) => {
    // Funções auxiliares simples (sem dependência de estado)
    const formatarData = (dataString) => {
        if (!dataString) return "N/A";
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const vagas = (projeto.vagas || []).filter(v => v.vagastatus === "Aberta");

    return (
        <Link href={`/projeto/${projeto.id}`} className={cardStyles.cardLink}>
            <div className={cardStyles.card}>
                <div>
                    <h3>{projeto.projtitulo}</h3>
                    <p className={cardStyles.descricao}>{projeto.projdesc ? `${projeto.projdesc.substring(0, 100)}...` : "Sem descrição."}</p>
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

    useEffect(() => {
        if (id) {
            setLoading(true);
            // Busca o usuário pelo ID da URL, incluindo suas associações
            // (Requer que seu 'usuario.controller.js -> findOne' inclua 'projetos' e 'projetosColaborando')
            api.get(`/usuarios/${id}`)
                .then(res => {
                    const data = res.data;
                    // Converte dados JSON
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

    // Junta os projetos que o usuário é dono E os que ele colabora
    const projetosOwned = perfil.projetos || [];
    const projetosCollab = perfil.projetosColaborando || [];
    
    // Cria um Map para remover duplicatas (caso seja dono e colaborador)
    const projectMap = new Map();
    [...projetosOwned, ...projetosCollab].forEach(p => projectMap.set(p.id, p));
    const projetosUnicos = Array.from(projectMap.values());


    return (
        <div className={styles.container}>
            {/* Card 1: Informações do Perfil */}
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <Avatar usufoto={perfil.usufoto} usunome={perfil.usunome} />
                    <div className={styles.profileInfo}>
                        <h1>{perfil.usunome}</h1>
                        <p>{perfil.usudisponibilidade || "Disponibilidade não informada"}</p>
                    </div>
                    {isOwner && (
                        <Link href={`/editar-perfil/${user.id}`} className={styles.editButton}>
                            Editar Perfil
                        </Link>
                    )}
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

            {/* Card 2: Projetos */}
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