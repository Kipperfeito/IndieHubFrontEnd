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
    
    return (
        <section>
            <h1>Listagem de Projetos</h1>
            {/* Renomeei a classe para algo mais genérico */}
            <div className={styles.galleryContainer}>
                {projetos?.length > 0 &&
                    projetos.map((projeto) => (
                        // Adicionado Link para navegar para /projeto/[id]
                        // Assumindo que seu objeto 'projeto' tem um 'id'
                        <Link
                            href={`/projeto/${projeto.id}`}
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
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
        </section>
    );
}