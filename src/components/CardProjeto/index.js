import { useEffect, useState } from "react";
import Link from "next/link"; // Importando o Link do Next.js para navegação
import styles from "./card.module.css";
import api from "@/services/api";

export default function ProjectGallery() {
    const [projetos, setProjetos] = useState([]);

    function getProjetos() {
        api
            .get("projetos") // Alterado de "produtos" para "projetos"
            .then((result) => {
                console.log(result.data);
                setProjetos(result.data);
            })
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        getProjetos();
    }, []);

    function formatarData(dataString) {
        if (!dataString) return "Data não informada";
        // Converte 'YYYY-MM-DD' para 'DD/MM/YYYY'
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderVagasAbertas(vagas) {
        if (!vagas || vagas.length === 0) {
            return <span className="project-tag">(Sem vagas)</span>;
        }

        const vagasAbertas = vagas.filter(vaga => vaga.vagastatus === "Aberta");

        if (vagasAbertas.length === 0) {
            return <span className="project-tag">(Sem vagas abertas no momento)</span>;
        }

        // 2. Pega os títulos das vagas abertas
        const titulosVagas = vagasAbertas.map(vaga => vaga.vagatitulo);

        // 3. Monta o JSX final
        return (
            <span className="project-tag">
                <strong>Vagas Abertas:</strong> 
                {/* Junta os títulos com vírgula. Ex: "Programador, Artista 2D" */}
                {titulosVagas.join(', ')}
            </span>
        );
    }
    
    return (
        <section>
            <div className={styles.galleryContainer}>
                {projetos?.length > 0 &&
                    projetos.map((projeto) => (

                        <Link
                            href={`/tela-proj/${projeto.id}`}
                            key={projeto.id}
                            className={styles.cardLink}
                        >
                            <div className={styles.card}>
                                <h3>{projeto.projtitulo || "Projeto Sem Título"}</h3>

                                {/* Limita a descrição para evitar que o card fique muito longo */}
                                <p className={styles.descricao}>
                                    {projeto.projdesc ? `${projeto.projdesc.substring(0, 100)}...` : "Sem descrição."}
                                </p>

                                <div className={styles.metaData}>
                                    <span>
                                        <strong>Owner:</strong> {projeto.owner ? projeto.owner.usunome : 'Desconhecido'}
                                    </span>
                                    <span>
                                        <strong>Publicado em:</strong> {formatarData(projeto.projdatapublicacao)}
                                    </span>
                                    {renderVagasAbertas(projeto.vagas)}
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
        </section>
    );
}