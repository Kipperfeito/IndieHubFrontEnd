import Head from "next/head";
import Header from '@/components/Header';
// biblioteca como 'lucide-react'
import { Users, Puzzle, Search } from 'lucide-react';
export default function Home() {
  return (
    <>
      <Head>
        <title>Indie Hub - Conecte-se e Crie Jogos Incríveis</title>
        <meta
          name="description"
          content="Onde desenvolvedores, artistas e criadores se encontram para construir o futuro dos jogos independentes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header/>

      <main className="landing-page">
        <section className="hero-section container">
          <h1>Sua Guilda de Desenvolvimento de Jogos</h1>
          <p>
            Conecte-se com artistas, programadores e músicos. Encontre a equipe perfeita e transforme sua ideia em um jogo de sucesso.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a href="/cadastro-usu" className="btn btn-primary">
              Comece a Colaborar
            </a>
            <a href="#features" className="btn btn-secondary">
              Explorar Recursos
            </a>
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
          <h2>Projetos em Destaque no Indie Hub</h2>
          <p>Veja exemplos de projetos que estão buscando colaboradores agora mesmo.</p>
          <div className="showcase-grid">
            <div className="project-card">
              <img src="https://via.placeholder.com/600x400" alt="Arte do jogo Cybernetic Echoes" />
              <div className="project-card-content">
                <h3>Cybernetic Echoes</h3>
                <p>RPG de Ação em um mundo cyberpunk. Projeto em fase de prototipagem.</p>
                <span className="project-tag">Vagas Abertas: Artista 2D</span>
              </div>
            </div>
            <div className="project-card">
              <img src="https://via.placeholder.com/600x400" alt="Arte do jogo Forest Whispers" />
              <div className="project-card-content">
                <h3>Forest Whispers</h3>
                <p>Jogo de puzzle e aventura com foco em narrativa. Buscando músico.</p>
                <span className="project-tag">Vagas Abertas: Músico</span>
              </div>
            </div>
            <div className="project-card">
              <img src="https://via.placeholder.com/600x400" alt="Arte do jogo Star Drifters" />
              <div className="project-card-content">
                <h3>Star Drifters</h3>
                <p>Simulador espacial 4X. Precisamos de ajuda com a UI/UX.</p>
                <span className="project-tag">Vagas Abertas: UI/UX Designer</span>
              </div>
            </div>
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