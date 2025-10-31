import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import HeaderLog from '@/components/HeaderLog';
import VagaCard from '@/components/VagaCard'; // Nosso novo componente
import styles from './ProjetoDetalhe.module.css';

function getYoutubeEmbedUrl(url) {
    try {
        const urlObj = new URL(url);
        // Para links 'watch?v='
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        // Para links 'youtu.be/'
        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.substring(1); // Remove a barra inicial
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        // Se for um link de embed, retorna ele mesmo
        if (urlObj.pathname.includes('/embed/')) {
            return url;
        }

    } catch (e) {
        console.error("URL de vídeo inválida:", url);
        return null; // Retorna nulo se a URL for inválida
    }
    return null; 
}

export default function ProjetoDetalhe() {
    const router = useRouter();
    const { id } = router.query; 

    const [projeto, setProjeto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        if (id) {
            setLoading(true);

            api.get(`/projetos/${id}`)
                .then(res => {
                    setProjeto(res.data);
                    console.log("Projeto carregado:", res.data);
                })
                .catch(err => {
                    console.error(err);
                    setError("Não foi possível carregar o projeto.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id]); 


    if (loading) {
        return <p>Carregando...</p>; // Pode ser um componente de Loading
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!projeto) {
        return <p>Projeto não encontrado.</p>; // Caso de segurança
    }

    // Filtra apenas as vagas abertas para exibição
    const vagasAbertas = projeto.vagas
        ? projeto.vagas.filter(vaga => vaga.vagastatus === 'Aberta')
        : [];

    return (
        <>
            <HeaderLog />
            <div className={styles.container}>

                {/* 1. MÍDIA (Imagens e Vídeos) */}
                <section className={styles.mediaGallery}>
                    {/* Verifica se tem mídia e se o array não está vazio */}
                    {(!projeto.projmedia || projeto.projmedia.length === 0) && (
                        <img src="https://via.placeholder.com/800x450?text=Projeto+Sem+Mídia" alt="Mídia do Projeto" />
                    )}

                    {projeto.projmedia && projeto.projmedia.map((item, index) => {
                        // RENDERIZA IMAGEM
                        if (item.tipo === 'imagem') {
                            return (
                                <img key={index} src={item.url} alt={`Mídia do projeto ${index + 1}`} />
                            );
                        }

                        // RENDERIZA VÍDEO
                        if (item.tipo === 'video') {
                            const embedUrl = getYoutubeEmbedUrl(item.url);
                            if (!embedUrl) return null; // Ignora links de vídeo inválidos

                            return (
                                <iframe
                                    key={index}
                                    width="800"
                                    height="450"
                                    src={embedUrl}
                                    title={`Vídeo do projeto ${index + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen>
                                </iframe>
                            );
                        }
                        return null; // Ignora tipos desconhecidos
                    })}
                </section>

                <main className={styles.mainContent}>
                    {/* 2. TÍTULO */}
                    <h1 className={styles.titulo}>{projeto.projtitulo}</h1>
                    <span className={styles.owner}>
                        Criado por: {projeto.owner ? projeto.owner.usunome : 'Desconhecido'}
                    </span>

                    {/* 3. DESCRIÇÃO */}
                    <section className={styles.descricao}>
                        <h2>Descrição</h2>
                        <p>{projeto.projdesc}</p>
                    </section>

                    {/* 4. LINKS */}
                    <section className={styles.links}>
                        <h2>Links</h2>
                        {/* ASSUMINDO que 'projeto.projlinks' é um objeto */}
                        {/* Ex: { github: '...', site: '...' } */}
                        <a href="#" target="_blank" rel="noopener noreferrer">GitHub do Projeto</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Website / Demo</a>
                    </section>

                    {/* 5. VAGAS */}
                    <section className={styles.vagasSection}>
                        <h2>Vagas Abertas ({vagasAbertas.length})</h2>
                        <div className={styles.vagasGrid}>
                            {vagasAbertas.length > 0 ? (
                                vagasAbertas.map(vaga => (
                                    <VagaCard key={vaga.id} vaga={vaga} />
                                ))
                            ) : (
                                <p>Nenhuma vaga aberta no momento.</p>
                            )}
                        </div>
                    </section>

                    {/* 6. COMENTÁRIOS / FEEDBACK */}
                    <section className={styles.commentsSection}>
                        <h2>Comentários e Feedback</h2>
                        <textarea
                            placeholder="Deixe seu comentário..."
                            rows="4"
                        ></textarea>
                        <button type="button">Enviar</button>
                    </section>
                </main>
            </div>
        </>
    );
}