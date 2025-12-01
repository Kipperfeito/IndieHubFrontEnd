import { useState } from 'react';
import api from '@/services/api'; // Seu axios
import styles from './cItem.module.css';

const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatarImage} />;
    }
    return (
        <div className={styles.avatarImage}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};

export default function CandidatoItem({ candidato, onDecisao }) {
    const [loading, setLoading] = useState(false);

    // Função para chamar a API de decisão
    const handleDecisao = async (status) => {
        if (!confirm(`Tem certeza que deseja ${status} este candidato?`)) return;
        
        setLoading(true);
        try {
            await api.put('/candidaturas/decidir', {
                status: status,
                vagaId: candidato.vagaId,    // Lembra que separamos isso no backend?
                usuarioId: candidato.usuarioId
            });
            onDecisao(candidato.id); // Avisa o pai para remover da lista
        } catch (error) {
            alert("Erro ao processar decisão");
            setLoading(false);
        }
    };

    return (
        <div className={styles.cardCandidato}>
            <div className={styles.header}>
                <div className={styles.infoUsuario}>
                    {/* Reutilizando seu Avatar arrumado */}
                    <Avatar usufoto={candidato.usuario.usufoto} usunome={candidato.usuario.usunome} />
                    
                    <div className={styles.textos}>
                        <h4 className={styles.nome}>{candidato.usuario.usunome}</h4>
                        <span className={styles.vagaBadge}>
                            Vaga: {candidato.vaga.vagatitulo}
                        </span>
                    </div>
                </div>
                
                <div className={styles.data}>
                    {candidato.createdAt ? new Date(candidato.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) 
                    : 'Data não disponível'}
                </div>
            </div>

            {/* AQUI É A NOVIDADE: A CARTA DE APRESENTAÇÃO */}
            <div className={styles.boxMensagem}>
                <p className={styles.labelMensagem}>Carta de Apresentação:</p>
                <p className={styles.textoMensagem}>
                    {candidato.mensagem ? candidato.mensagem : "O candidato não enviou mensagem."}
                </p>
            </div>

            <div className={styles.actions}>
                {/* Botões de Ação */}
                <button 
                    onClick={() => handleDecisao('rejeitado')} 
                    className={styles.btnRejeitar}
                    disabled={loading}
                >
                    Recusar
                </button>
                
                <button 
                    onClick={() => handleDecisao('aprovado')} 
                    className={styles.btnAprovar}
                    disabled={loading}
                >
                    {loading ? "Processando..." : "Aprovar e Adicionar ao Time"}
                </button>
            </div>
        </div>
    );
}