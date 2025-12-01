import Head from "next/head";
import { useState, useEffect } from "react"; // 1. Importar hooks
import { Users, Puzzle, Search } from 'lucide-react';
import api from "@/services/api"; // 2. Importar sua API (ajuste o caminho se necessário)
import Link from "next/link"; // Opcional: para links internos

export default function Home() {
  const [projetos, setProjetos] = useState([]); // 3. Estado para guardar os projetos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjetos() {
      try {
        // Busca todos os projetos (ou crie uma rota específica '/projetos/destaque')
        const response = await api.get('/projetos');

        // 4. Limita a lista para apenas os 3 primeiros itens
        const apenasTres = response.data.slice(0, 3);

        setProjetos(apenasTres);
      } catch (error) {
        console.error("Erro ao buscar projetos da home:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjetos();
  }, []);

  return (
    <>
      <Head>
        <title>Indie Hub - Conecte-se e Crie Jogos Incríveis</title>
        <meta name="description" content="Onde desenvolvedores se encontram." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="landing-page">
        <section className="hero-section container">
          <h1>Sua Guilda de Desenvolvimento de Jogos</h1>
          <p>
            Conecte-se com artistas, programadores e músicos. Encontre a equipe perfeita e transforme sua ideia em um jogo de sucesso.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a href="/cadastro-usu" className="btn btn-primary">Comece a Colaborar</a>
            <a href="/inicial" className="btn btn-secondary">Explorar Recursos</a>
          </div>
        </section>

        <section id="features" className="container">
          <h2>Tudo que você precisa para seu projeto Indie</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Users />
              <h3>Crie seu Perfil Profissional</h3>
              <p>Mostre suas habilidades com tags, portfólio e nível de proficiência.</p>
            </div>
            <div className="feature-card">
              <Puzzle />
              <h3>Publique seu Projeto</h3>
              <p>Apresente seu jogo, defina o estágio de desenvolvimento e abra vagas.</p>
            </div>
            <div className="feature-card">
              <Search />
              <h3>Encontre Conexões</h3>
              <p>Utilize nossa busca para encontrar projetos ou talentos para sua equipe.</p>
            </div>
          </div>
        </section>

        <section id="discover" className="container">
          <h2>Projetos em Destaque</h2>
          <div className="showcase-grid">
            {loading ? (
              <p>Carregando projetos...</p>
            ) : projetos.length > 0 ? (
              projetos.map((projeto) => (
                <div key={projeto.id} className="project-card">
                  <div className="project-card-content">

                    {/* Bloco Superior: Título e Descrição */}
                    <div>
                      <h3>{projeto.projtitulo}</h3>
                      <p>
                        {projeto.projdesc.length > 120
                          ? projeto.projdesc.substring(0, 120) + "..."
                          : projeto.projdesc}
                      </p>
                    </div>

                    {/* Bloco Inferior: Rodapé do Card */}
                    <div className="project-card-footer">
                      {/* Renderização condicional da Tag com classes específicas */}
                      {projeto.vagas && projeto.vagas.length > 0 ? (
                        <span className="project-tag vagas-on">
                          Há {projeto.vagas.length} vaga(s).
                        </span>
                      ) : (
                        <span className="project-tag vagas-off">
                          Não há vagas
                        </span>
                      )}

                      {/* Link estilizado */}
                      <a href={`/tela-proj/${projeto.id}`} className="project-link">
                        Veja os detalhes →
                      </a>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum projeto em destaque no momento.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="container">
          © {new Date().getFullYear()} Indie Hub. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}