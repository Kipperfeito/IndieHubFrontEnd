import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import Link from "next/link";
import styles from "./meus.module.css";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function MeusProjetos() {
    const router = useRouter();
    const [projetos, setProjetos] = useState([]);
    const { user } = useAuth();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

    function formatarData(dataString) {
        if (!dataString) return "Data não informada";
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderVagasAbertas(vagas) {
        if (!vagas || vagas.length === 0) {
            return <span>(Sem vagas)</span>;
        }
        const vagasAbertas = vagas.filter(vaga => vaga.vagastatus === "Aberta");
        if (vagasAbertas.length === 0) {
            return <span>(Sem vagas abertas)</span>;
        }
        const titulosVagas = vagasAbertas.map(vaga => vaga.vagatitulo);
        return (
            <span>
                <strong>Vagas Abertas:</strong> {titulosVagas.join(', ')}
            </span>
        );
    }

    useEffect(() => {
        if (user && user.id) {
            api
                .get("projetos") // Puxa TODOS os projetos
                .then((result) => {
                    const meusProjetos = result.data.filter(projeto => {
                        return projeto.ownerId === user.id;
                    });
                    setProjetos(meusProjetos);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    const handleDeleteClick = (e, projetoId) => {
        e.preventDefault(); // Impede o <Link> de navegar
        e.stopPropagation(); // Impede qualquer outro evento de clique
        setConfirmDeleteId(projetoId);
    };
    const handleCancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDeleteId(null);
    };
    const handleConfirmDelete = (e, projetoId) => {
        e.preventDefault();
        e.stopPropagation();

        api.delete(`/projetos/${projetoId}`)
            .then(() => {
                setProjetos(prevProjetos =>
                    prevProjetos.filter(p => p.id !== projetoId)
                );
                setConfirmDeleteId(null);
            })
            .catch(err => {
                console.error("Erro ao excluir projeto:", err);
                alert("Erro ao excluir projeto:", err)
                setConfirmDeleteId(null);
            });
    };

    const handleDeleteAllClick = (e) => {
    e.preventDefault(); // Impede o <Link> de navegar
    e.stopPropagation(); // Impede qualquer outro evento de clique
    setConfirmDeleteAll(true);
    };
    const handleCancelDeleteAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDeleteAll(false);
    };
    const handleConfirmDeleteAll = (e, projetoId) => {
        e.preventDefault();
        e.stopPropagation();

        api.delete(`/projetos/`)
            .then(() => {
                setProjetos(prevProjetos =>
                    prevProjetos.filter(p => p.id !== projetoId)
                );
                setConfirmDeleteAll(false);
            })
            .catch(err => {
                console.error("Erro ao excluir projetos:", err);
                alert("Erro ao excluir projetos:", err)
                setConfirmDeleteAll(false);
            });
    };
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Meus Projetos</h1>
            {projetos.length > 0 && (
                <div className={styles.pageActions}>
                    {confirmDeleteAll ? (
                        // Mostra a confirmação
                        <div className={styles.confirmationBox}>
                            <span>Tem certeza que quer excluir TODOS os seus projetos?</span>
                            <div>
                                <button
                                    onClick={handleCancelDeleteAll}
                                    className={`${styles.footerButton} ${styles.btnCancel}`}
                                >
                                    Não
                                </button>
                                <button
                                    onClick={handleConfirmDeleteAll}
                                    className={`${styles.footerButton} ${styles.btnConfirm}`}
                                >
                                    Sim
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleDeleteAllClick}
                            className={styles.btnDangerLarge} 
                        >
                            Excluir Todos os Projetos
                        </button>
                    )}
                </div>
            )}
            </div>
            {projetos.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p>Você ainda não criou nenhum projeto.</p>
                    <Link href="/cadastro-proj" style={{ color: 'var(--color-primary)' }}>
                        Crie seu primeiro projeto!
                    </Link>
                </div>
            )}

            <div className={styles.galleryContainer}>
                {projetos?.length > 0 &&
                    projetos.map((projeto) => (
                        <Link
                            href={`/tela-proj/${projeto.id}`}
                            key={projeto.id}
                            className={styles.cardLink}
                        >
                            <div className={styles.card}>
                                <div> {/* Wrapper para o conteúdo principal do card */}
                                    <h3>{projeto.projtitulo || "Projeto Sem Título"}</h3>
                                    <p className={styles.descricao}>
                                        {projeto.projdesc ? `${projeto.projdesc.substring(0, 100)}...` : "Sem descrição."}
                                    </p>
                                    <div className={styles.metaData}>
                                        <span>
                                            <strong>Publicado em:</strong> {formatarData(projeto.projdatapublicacao)}
                                        </span>
                                        {renderVagasAbertas(projeto.vagas)}
                                    </div>
                                </div>
                                <div className={styles.cardFooter}>
                                    {confirmDeleteId === projeto.id ? (
                                        <div className={styles.confirmationBox}>
                                            <span>Tem certeza?</span>
                                            <div>
                                                <button
                                                    onClick={handleCancelDelete}
                                                    className={`${styles.footerButton} ${styles.btnCancel}`}
                                                >
                                                    Não
                                                </button>
                                                <button
                                                    onClick={(e) => handleConfirmDelete(e, projeto.id)}
                                                    className={`${styles.footerButton} ${styles.btnConfirm}`}
                                                >
                                                    Sim
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => handleDeleteClick(e, projeto.id)}
                                            className={`${styles.footerButton} ${styles.btnDanger}`}
                                        >
                                            Excluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
}