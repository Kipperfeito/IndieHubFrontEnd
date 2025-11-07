import styles from './VagaCard.module.css';

export default function VagaCard({ vaga }) {
    if (!vaga) return null;

    return (
        <div className={styles.card}>
            <h4 className={styles.titulo}>{vaga.vagatitulo}</h4>
            <p className={styles.descricao}>{vaga.vagadesc}</p>
            
            <h5 className={styles.requisitosTitulo}>Requisitos:</h5>
            <p className={styles.requisitos}>{vaga.vagarequisitos || "Não especificado"}</p>
            
            <button className={styles.candidatarBtn} type="button">
                Candidatar-se
            </button>
        </div>
    );
}