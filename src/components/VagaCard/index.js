import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import styles from './VagaCard.module.css';

const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatar} />;
    }
    // Fallback estilo WhatsApp
    return (
        <div className={styles.avatar}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};

export default function VagaCard({ vaga, ownerId }) {
    const { user } = useAuth();
    console.log("Dados do Usuário:", user);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [candidatado, setCandidatado] = useState(false); 
    const [showModal, setShowModal] = useState(false); 
    const [mensagem, setMensagem] = useState('');

    if (!vaga) return null;

    const handleAbrirModal = () => {
        if (!user) {
            alert("Faça login para continuar.");
            router.push('/login');
            return;
        }
        if (user.id === ownerId) {
            alert("Você é o dono desta vaga.");
            return;
        }
        setShowModal(true); 
    };

    const handleConfirmarEnvio = async () => {
        setLoading(true);
        try {
            await api.post(`/vagas/${vaga.id}/candidatar`, { 
                mensagem: mensagem 
            });
            
            alert("Proposta enviada com sucesso!");
            setCandidatado(true);
            setShowModal(false); // Fecha o modal
            setMensagem('');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Erro ao enviar proposta.";
            alert(msg);
            if (msg.includes("já se candidatou")) setCandidatado(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.card}>
                <h4 className={styles.titulo}>{vaga.vagatitulo}</h4>
                <p className={styles.descricao}>{vaga.vagadesc}</p>
                
                {vaga.vagarequisitos && (
                    <>
                        <h5 className={styles.requisitosTitulo}>Requisitos:</h5>
                        <p className={styles.requisitos}>{vaga.vagarequisitos}</p>
                    </>
                )}
                
                <button 
                    className={`${styles.candidatarBtn} ${candidatado ? styles.btnSuccess : ''}`} 
                    onClick={handleAbrirModal}
                    disabled={loading || candidatado}
                >
                    {candidatado ? "Proposta Enviada" : "Enviar Proposta"}
                </button>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    {/* O e.stopPropagation impede que clicar no modal feche ele mesmo */}
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Nova Proposta</h3>
                            <button className={styles.closeX} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className={styles.profilePreview}>
                            <Avatar usufoto={user.usufoto} usunome={user.usunome}/>
                            <div className={styles.nome}>
                                <p className={styles.labelPreview}>Você está aplicando como:</p>
                                <strong>{user.usunome}</strong>
                            </div>
                        </div>
                        <label className={styles.labelArea}>
                            Carta de Apresentação & Links
                        </label>
                        <textarea
                            className={styles.textArea}
                            rows={6}
                            placeholder={`Olá! Gostaria de participar porque...\n\nMeu portfólio: https://...\nMeu LinkedIn: https://...`}
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            disabled={loading}
                        />
                        <p className={styles.hint}>
                            Dica: Cole links diretos para seus trabalhos mais relevantes.
                        </p>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.cancelarBtn} 
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.enviarBtn} 
                                onClick={handleConfirmarEnvio}
                                disabled={loading}
                            >
                                {loading ? "Enviando..." : "Enviar Proposta"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}