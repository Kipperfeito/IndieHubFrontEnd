import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link'; // Se estiver usando Next.js
import styles from './listaVaga.module.css';

export default function GerenciarVagas() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVagas();
  }, []);

  const fetchVagas = async () => {
    try {
      const res = await api.get('/vagas/gerenciar');
      setVagas(res.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar suas vagas.");
    } finally {
      setLoading(false);
    }
  };
  const handleExcluir = async (idVaga) => {
      if (!confirm("Tem certeza que deseja excluir esta vaga? As candidaturas também serão perdidas.")) {
          return;
      }

      try {
          await api.delete(`/vagas/${idVaga}`);

          setVagas(currentVagas => currentVagas.filter(v => v.id !== idVaga));
          alert("Vaga excluída com sucesso!");
      } catch (error) {
          console.error("Erro ao excluir:", error);
          alert(error.response?.data?.message || "Erro ao excluir vaga.");
      }
  };

  if (loading) return <div>Carregando painel...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Painel de Vagas</h1>
      </div>

      <div className={styles.grid}>
        {vagas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Você não criou nenhuma vaga ainda.</p>
          </div>
        ) : (
          vagas.map(vaga => {
            const qtd = vaga.candidatos ? vaga.candidatos.length : 0;

            return (
              <div key={vaga.id} className={styles.card}>
                {/* Conteúdo Principal */}
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.projetoNome}>
                      {vaga.projeto.projtitulo}
                    </span>
                    {qtd > 0 && (
                      <span className={styles.badge}>
                        {qtd} novo{qtd > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <h3 className={styles.vagaTitulo}>{vaga.vagatitulo}</h3>

                  <div className={styles.metaData}>
                    Status:
                    <span className={vaga.vagastatus ? styles.statusAberto : styles.statusFechado}>
                      {vaga.vagastatus ? ' Aberta' : ' Fechada'}
                    </span>
                  </div>
                </div>

                {/* Footer de Ação */}
                <div className={styles.cardFooter}>
                  <button 
                      className={styles.btnExcluir}
                      onClick={() => handleExcluir(vaga.id)}
                      title="Excluir Vaga"
                  >
                      {/* Ícone SVG de lixeira simples */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                  </button>
                  <Link href={`/lista-vaga/candidatos/${vaga.projeto.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <button className={`${styles.btnAction} ${qtd > 0 ? styles.btnPrimary : styles.btnSecondary}`}>
                      {qtd > 0 ? "Avaliar Candidatos" : "Ver Detalhes"}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}