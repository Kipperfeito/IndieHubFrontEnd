// components/MediaModal.js
import React from 'react';
import styles from './MediaModal.module.css'; // Vamos criar este CSS

export default function MediaModal({ media, currentIndex, onClose, onNavigate }) {
    if (!media || media.length === 0 || currentIndex === null) {
        return null; // Não mostra nada se não houver mídia ou índice inválido
    }

    const currentMedia = media[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === media.length - 1;

    // Transforma URL do YouTube para embed
    const getYoutubeEmbedUrl = (url) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                const videoId = urlObj.searchParams.get('v') || urlObj.pathname.substring(1);
                return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (e) {
            console.error("URL de vídeo inválida no modal:", url);
        }
        return null;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Botão para fechar o modal */}
                <button className={styles.closeButton} onClick={onClose}>&times;</button>

                {/* Conteúdo da Mídia Atual */}
                <div className={styles.mediaContainer}>
                    {currentMedia.tipo === 'imagem' ? (
                        <img 
                            src={currentMedia.url} 
                            alt={`Mídia ${currentIndex + 1}`} 
                            className={styles.mediaItem} 
                        />
                    ) : (
                        <iframe
                            className={styles.mediaItem}
                            src={getYoutubeEmbedUrl(currentMedia.url)}
                            title={`Vídeo ${currentIndex + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    )}
                </div>

                {/* Botões de Navegação */}
                {!isFirst && (
                    <button 
                        className={`${styles.navButton} ${styles.prev}`} 
                        onClick={() => onNavigate(-1)}
                    >
                        &lt;
                    </button>
                )}
                {!isLast && (
                    <button 
                        className={`${styles.navButton} ${styles.next}`} 
                        onClick={() => onNavigate(1)}
                    >
                        &gt;
                    </button>
                )}
            </div>
        </div>
    );
}