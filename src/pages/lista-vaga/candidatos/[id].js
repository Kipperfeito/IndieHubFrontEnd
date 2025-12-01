import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';
import CandidatoItem from '@/components/CandidatoItem'; // Ajuste o caminho conforme sua pasta
import styles from './Candidatos.module.css';

export default function CandidatosProjeto() {
    const router = useRouter();
    const { id } = router.query; // Pega o ID do projeto da URL
    
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projetoTitulo, setProjetoTitulo] = useState(''); // Para mostrar no cabeçalho

    useEffect(() => {
        if (id) {
            fetchCandidatos();
        }
    }, [id]);

    const fetchCandidatos = async () => {
        try {
            // Chama aquela rota que consertamos lá no começo
            const response = await api.get(`/projetos/${id}/candidatos`); 
            
            // O backend retorna uma lista. 
            // Se tiver alguém, pegamos o título do projeto do primeiro item para exibir no header
            const dados = response.data;
            setCandidatos(dados);
            
            if (dados.length > 0) {
                const titulo = dados[0]?.vaga?.projeto?.projtitulo || "Projeto";
                setProjetoTitulo(titulo);
            }
        } catch (error) {
            console.error("Erro ao buscar candidatos:", error);
            alert("Erro ao carregar lista de candidatos.");
        } finally {
            setLoading(false);
        }
    };

    // Função que será chamada quando você clicar em Aprovar/Rejeitar no filho
    const handleDecisaoTomada = (idVirtualRemovido) => {
        // Remove visualmente o candidato da lista sem precisar recarregar a tela
        setCandidatos(prev => prev.filter(c => c.id !== idVirtualRemovido));
    };

    if (loading) return <div className={styles.loading}>Carregando candidatos...</div>;

    return (
        <div className={styles.pageContainer}>
            {/* Cabeçalho com botão de Voltar */}
            <header className={styles.header}>
                <div>
                    <Link href="/lista-vaga" className={styles.btnVoltar}>
                        ← Voltar para Painel
                    </Link>
                    <h1 className={styles.title}>
                        Avaliar Candidatos
                        {projetoTitulo && <span className={styles.subtitle}> • {projetoTitulo}</span>}
                    </h1>
                </div>
            </header>

            {/* Lista ou Estado Vazio */}
            <div className={styles.content}>
                {candidatos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <img src="/assets/empty-box.svg" alt="" className={styles.emptyIcon} /> {/* Opcional */}
                        <h3>Tudo limpo por aqui!</h3>
                        <p>Não há candidaturas pendentes para este projeto no momento.</p>
                        <Link href="/lista-vaga">
                            <button className={styles.btnVoltarGrande}>Voltar para meus projetos</button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.listaCandidatos}>
                        <p className={styles.contador}>
                            Mostrando <strong>{candidatos.length}</strong> candidato(s) pendente(s)
                        </p>
                        
                        {candidatos.map(candidato => (
                            <CandidatoItem 
                                key={candidato.id} 
                                candidato={candidato} 
                                onDecisao={handleDecisaoTomada} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}