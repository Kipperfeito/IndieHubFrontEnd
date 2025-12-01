import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import Link from 'next/link';
import VagaCard from '@/components/VagaCard'; // Nosso novo componente
import styles from './ProjetoDetalhe.module.css';
import { useAuth } from '@/context/AuthContext';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
    </svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

function getYoutubeEmbedUrl(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.substring(1);
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        if (urlObj.pathname.includes('/embed/')) {
            return url;
        }

    } catch (e) {
        console.error("URL de vídeo inválida:", url);
        return null;
    }
    return null; 
}

export default function ProjetoDetalhe() {
    const router = useRouter();
    const { id } = router.query; 

    const [projeto, setProjeto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0); 
    const [isLightboxOpen, setIsLightboxOpen] = useState(false); 

    const [candidatos, setCandidatos] = useState([]);

    const { user, loading: authLoading } = useAuth();

    const fetchData = useCallback(() => {
        if (id) {
            setLoading(true);
            api.get(`/projetos/${id}`)
                .then(res => {
                    setProjeto(res.data);
                })
                .catch(err => {
                    console.error(err);
                    setError("Não foi possível carregar o projeto.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    useEffect(() => {
        if (router.isReady && id) fetchData();
    }, [router.isReady, id, fetchData]); 

    useEffect(() => {
        if (id && user && projeto && user.id === projeto.ownerId) {
            console.log("Buscando candidatos para o projeto...");
            
            api.get(`/projetos/${id}/candidatos`)
                .then(res => {
                    console.log("Candidatos encontrados:", res.data);
                    setCandidatos(res.data);
                })
                .catch(err => console.error("Erro ao buscar candidatos:", err));
        }
    }, [id, user, projeto]); 

    const handleDecisao = (candidaturaId, status, vagaId, usuarioId) => {
        console.log("Enviando:", { status, vagaId, usuarioId });
        api.put(`/candidaturas/decidir`, { status, vagaId, usuarioId })
            .then(() => {
                alert(`Candidato ${status}!`);
                // Remove o candidato da lista visualmente
                setCandidatos(prev => prev.filter(c => c.id !== candidaturaId));
            })
            .catch(err => {
                console.error("Erro detalhado:", err);
                const msg = err.response?.data?.message || "Erro ao processar decisão.";
                alert(msg);}
            );
    };

    if (loading || authLoading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!projeto) {
        return <p>Projeto não encontrado.</p>; 
    }

    const vagasAbertas = projeto.vagas
        ? projeto.vagas.filter(vaga => vaga.vagastatus === 'Aberta')
        : [];
    
    const links = projeto.projlinks || {};
    const linksValidos = Object.entries(links).filter(([key, url]) => url && url.trim() !== '');

    const mediaItems = projeto.projmedia || [];
    const hasMedia = mediaItems.length > 0;
    const currentMedia = hasMedia ? mediaItems[currentMediaIndex] : null;

    const isOwner = user && user.id === projeto.owner?.id;

    const navigateMedia = (direction) => {
        let newIndex = currentMediaIndex + direction;
        if (newIndex < 0) {
            newIndex = mediaItems.length - 1;
        } else if (newIndex >= mediaItems.length) {
            newIndex = 0;
        }
        setCurrentMediaIndex(newIndex);
    };

    const openLightbox = (index) => {
        setCurrentMediaIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        // Para vídeos, parar o autoplay quando fechar o lightbox
        setCurrentMediaIndex(0); // Volta para a primeira mídia ao fechar
    };

    const renderMediaItem = (item, isMainView = false) => {
        if (!item) return null;

        if (item.tipo === 'imagem') {
            return (
                <img 
                    src={item.url} 
                    alt={`Mídia do projeto`} 
                    className={isMainView ? styles.mainMediaImage : styles.thumbnailImage}
                    onClick={() => isMainView && openLightbox(currentMediaIndex)} 
                />
            );
        }

        if (item.tipo === 'video') {
            const embedUrl = getYoutubeEmbedUrl(item.url);
            if (!embedUrl) return null;
            if (isMainView || isLightboxOpen) { 
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title={`Vídeo do projeto`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                );
            } else {
                const videoId = item.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/200x112?text=Video";
                return (
                    <div className={styles.videoThumbnailWrapper}>
                        <img 
                            src={thumbnailUrl} 
                            alt="Video Thumbnail" 
                            className={styles.thumbnailImage} 
                            onClick={() => openLightbox(currentMediaIndex)}
                        />
                        <div className={styles.playIcon}>▶</div> {/* Ícone de play */}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <>
            <div className={styles.container}>
                <section className={styles.mediaSection}>
                        <div className={styles.mainMediaViewer}>
                            {!hasMedia ? (
                                <img src="https://via.placeholder.com/800x450?text=Projeto+Sem+Mídia" alt="Mídia do Projeto" className={styles.mainMediaImage} />
                            ) : (
                                <>
                                    {hasMedia && mediaItems.length > 1 && (
                                        <>
                                            <button 
                                                className={`${styles.navButton} ${styles.prevButton}`} 
                                                onClick={() => navigateMedia(-1)}
                                                aria-label="Mídia anterior"
                                            >
                                                <ChevronLeftIcon />
                                            </button>
                                            <button 
                                                className={`${styles.navButton} ${styles.nextButton}`} 
                                                onClick={() => navigateMedia(1)}
                                                aria-label="Próxima mídia"
                                            >
                                                <ChevronRightIcon />
                                            </button>
                                        </>
                                    )}
                                    {renderMediaItem(currentMedia, true)}
                                </>
                            )}
                        </div>
                        {hasMedia && (
                            <div className={styles.thumbnailGallery}>
                                {mediaItems.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`${styles.thumbnailWrapper} ${index === currentMediaIndex ? styles.activeThumbnail : ''}`}
                                        onClick={() => setCurrentMediaIndex(index)}
                                    >
                                        {renderMediaItem(item, false)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                <main className={styles.mainContent}>
                    <div className={styles.titleHeader}>
                        <h1 className={styles.titulo}>{projeto.projtitulo}</h1>
                        {isOwner && (
                            <Link href={`/editar-proj/${projeto.id}`} className={styles.editButton}>
                                Editar Projeto
                            </Link>
                        )}
                    </div>
                    <div className={styles.metaInfo}>
                        <Link href={`/perfil/${projeto.ownerId}`} className={styles.owner}>
                            Criado por: {projeto.owner ? projeto.owner.usunome : 'Desconhecido'}
                        </Link>
                        
                        {projeto.colaboradores && projeto.colaboradores.length > 0 && (
                            <div className={styles.collaboratorList}>
                                <span>Colaboradores:</span>
                                {projeto.colaboradores.map((colaborador, index) => (
                                    <span key={colaborador.id}>
                                        <Link href={`/perfil/${colaborador.id}`} className={styles.collaboratorLink}>
                                            {colaborador.usunome}
                                        </Link>
                                        {index < projeto.colaboradores.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <section className={styles.descricao}>
                        <h2>Descrição</h2>
                        <p>{projeto.projdesc}</p>
                    </section>

                    <section className={styles.links}>
                        <h2>Links</h2>
                        
                        {linksValidos.length > 0 ? (
                            linksValidos.map(([plataforma, url]) => (
                                <a 
                                    key={plataforma} 
                                    href={url}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    {/* Transforma 'github' em 'GitHub', 'itchio' em 'Itch.io' */}
                                    {plataforma.charAt(0).toUpperCase() + plataforma.slice(1)}
                                </a>
                            ))
                        ) : (
                            <p>Nenhum link foi adicionado a este projeto.</p>
                        )}
                    </section>

                    <section className={styles.vagasSection}>
                        <h2>Vagas Abertas ({vagasAbertas.length})</h2>
                        <div className={styles.vagasGrid}>
                            {vagasAbertas.length > 0 ? (
                                vagasAbertas.map(vaga => (
                                    <VagaCard key={vaga.id} vaga={vaga} ownerId={projeto.ownerId} />
                                ))
                            ) : (
                                <p>Nenhuma vaga aberta no momento.</p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
            {isLightboxOpen && (
                <div className={styles.lightboxOverlay} onClick={closeLightbox}>
                    <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}> 
                        <button className={styles.lightboxCloseButton} onClick={closeLightbox}>
                            <CloseIcon />
                        </button>
                        
                        {mediaItems.length > 1 && (
                            <>
                                <button className={`${styles.lightboxNavButton} ${styles.lightboxPrev}`} onClick={() => navigateMedia(-1)}>
                                    <ChevronLeftIcon />
                                </button>
                                <button className={`${styles.lightboxNavButton} ${styles.lightboxNext}`} onClick={() => navigateMedia(1)}>
                                    <ChevronRightIcon />
                                </button>
                            </>
                        )}
                        
                        <div className={styles.lightboxMedia}>
                            {renderMediaItem(currentMedia, true)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}