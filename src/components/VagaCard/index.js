import { useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import styles from './VagaCard.module.css';

export default function VagaCard({ vaga,  ownerId }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [candidatado, setCandidatado] = useState(false); // Poderia vir do backend se o usuário já se candidatou

    if (!vaga) return null;

    const handleCandidatar = async () => {
        if (!user) {
            alert("Você precisa estar logado para se candidatar.");
            router.push('/login');
            return;
        }
        if (user.id === ownerId) {
            alert("Você não pode candidatar-se! Você que criou esta vaga.");
            return;
        }
        if (!confirm(`Deseja se candidatar para a vaga de ${vaga.vagatitulo}?`)) {
            return;
        }

        setLoading(true);

        try {
            await api.post(`/vagas/${vaga.id}/candidatar`);
            
            alert("Candidatura enviada com sucesso! O dono do projeto será notificado.");
            setCandidatado(true); 
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Erro ao se candidatar.";
            alert(msg);
            
            if (msg.includes("já se candidatou")) {
                setCandidatado(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
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
                type="button"
                onClick={handleCandidatar}
                disabled={loading || candidatado}
            >
                {loading ? "Enviando..." : candidatado ? "Candidatura Enviada" : "Candidatar-se"}
            </button>
        </div>
    );
}