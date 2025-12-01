import { useState } from "react";
import { useRouter } from 'next/router';
import SearchBar from "@/components/SearchBar"; 
import CardProjeto from "@/components/CardProjeto";
import Link from "next/link"; 
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import styles from "./telaInicial.module.css";

const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <div style={{width: '30px', 
                  height: '30px',
                  borderRadius: '50%', 
                  objectFit: 'cover',  
                  backgroundColor: '#ddd', 
                  flexShrink: '0',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',   
                  overflow: 'hidden'}}
                  >
                    <img src={usufoto} alt={usunome} />
                </div>;
    }

    return (
        <div style={{width: '30px', 
                  height: '30px',
                  borderRadius: '50%', 
                  objectFit: 'cover',  
                  backgroundColor: '#ddd', 
                  flexShrink: '0',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',   
                  overflow: 'hidden'}}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};

const SearchResultsList = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '500px', 
      backgroundColor: 'white', 
      borderRadius: '8px',
      marginTop: '8px',
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
      position: 'absolute', 
      top: '45px', 
      right: '45px',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {results.map((item, index) => {
        const { type, data } = item;

        return (
          <div key={`${type}-${data.id}`} style={{ borderBottom: '1px solid #f0f0f0' }}>

            <Link 
                href={
                    type === 'usuario' ? `/perfil/${data.id}` : 
                    type === 'projeto' ? `/tela-proj/${data.id}` : 
                    `/tela-proj/${data.projeto?.id}` 
                } 
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '12px 20px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    

                    {type === 'usuario' && (
                        <Avatar usufoto={data.usufoto} usunome={data.usunome} />
                    )}
                    {type === 'projeto' && <span style={{fontSize: '1.2rem'}}>🎮</span>}
                    {type === 'vaga' && <span style={{fontSize: '1.2rem'}}>💼</span>}
                    <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {type === 'usuario' ? data.usunome : 
                             type === 'projeto' ? data.projtitulo : 
                             data.vagatitulo}
                        </p>
                        
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                            {type === 'usuario' ? 'Desenvolvedor' : 
                             type === 'projeto' ? 'Projeto Indie' : 
                             `Vaga no projeto: ${data.projeto?.projtitulo}`}
                        </p>
                    </div>
                </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const HomeHeader = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(null);

    // Lógica simples para abrir/fechar menus
    const handleMouseEnter = (menu) => setMenuAberto(menu);
    const handleMouseLeave = () => setMenuAberto(null);
    const handleToggle = (menu) => setMenuAberto(menuAberto === menu ? null : menu);

    if (!user) return  router.push(`/login`);

    return (
        <header className={styles.headerContainer}>
            <nav className={styles.navbar}>

                {/* Lado Direito: Menu */}
                <ul className={styles.menu}>
                    
                    {/* MENU PERFIL */}
                    <li 
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter('perfil')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className={styles.navLink} onClick={() => handleToggle('perfil')}>
                            Perfil <span className={styles.arrow}>▼</span>
                        </button>
                        
                        {menuAberto === 'perfil' && (
                            <ul className={styles.dropdownMenu}>
                                <li>
                                    <Link href={`/perfil/${user.id}`} className={styles.dropdownItem}>
                                        Ver Perfil
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={logout} className={styles.dropdownItem}>
                                        Sair
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* MENU PROJETO */}
                    <li 
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter('projeto')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className={styles.navLink} onClick={() => handleToggle('projeto')}>
                            Projetos <span className={styles.arrow}>▼</span>
                        </button>

                        {menuAberto === 'projeto' && (
                            <ul className={styles.dropdownMenu}>
                                <li><Link href="/meus-projetos" className={styles.dropdownItem}>Meus Projetos</Link></li>
                                <li><Link href="/cadastro-proj" className={styles.dropdownItem}>Criar Projeto</Link></li>
                                <li><Link href="/lista-vaga" className={styles.dropdownItem}>Gerenciar Vagas</Link></li>
                            </ul>
                        )}
                    </li>

                    {/* CONEXÕES */}
                    <li className={styles.menuItem}>
                        <Link href={`/meus-amigos/${user.id}`} className={styles.navLink}>
                            Conexões
                        </Link>
                    </li>

                    {/* NOTIFICAÇÕES */}
                    <li className={styles.iconItem}>
                        <NotificationBell />
                    </li>
                </ul>
            </nav>
        </header>
    );
}
export default function TelaInicial() {
  const [results, setResults] = useState([]);

  // Tags estáticas para a sidebar (parece dinâmico para quem vê)
  const popularTags = [
    'C#',
    'Unity',
    'Music Producer',
    'JavaScript',
    'React',
    'SQL',
    'Node.js',
    'UX Design',
    'UI Design'
  ];

  return (
    <div className={styles.container}>
      <HomeHeader />

      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Indie Hub</h1>
        <p className={styles.heroSubtitle}>Conecte-se com desenvolvedores, encontre times e publique seus jogos.</p>
        
        <div className={styles.searchWrapper}>
          <SearchBar setResults={setResults} />

          {results.length > 0 && <SearchResultsList results={results} />}
        </div>
      </section>

      {/* --- CONTEÚDO PRINCIPAL (Grid) --- */}
      <main className={styles.mainContent}>
        
        {/* COLUNA ESQUERDA: Feed de Projetos */}
        <div className={styles.feedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Projetos em Destaque</h2>
          </div>
          
          <div className={styles.projectsGrid}>
            {/* Seus cards atuais vão aqui. 
                DICA: Se o CardProjeto tiver width fixa, mude para width: 100% no CSS dele */}
            <CardProjeto />
          </div>
        </div>

        {/* COLUNA DIREITA: Sidebar (O Futuro) */}
        <aside className={styles.sidebar}>
          
          {/* WIDGET 1: Vagas/Tags em Alta */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>🔥 Em Alta no Hub</h3>
            <div className={styles.tagsCloud}>
              {popularTags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* WIDGET 2: Comunidade / Fórum (Fake) */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💬 Discussões Recentes</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <span>Qual a melhor engine para 2D?</span>
                <small style={{color:'#666'}}>32 com.</small>
              </li>
              <li className={styles.linkItem}>
                <span>Procuro artista para Game Jam</span>
                <small style={{color:'#666'}}>5 com.</small>
              </li>
              <li className={styles.linkItem}>
                <span>Feedback no meu protótipo</span>
                <small style={{color:'#666'}}>12 com.</small>
              </li>
            </ul>
            <div style={{marginTop:'1rem', textAlign:'center'}}>
               <small style={{color:'#888', fontStyle:'italic'}}>Fórum em breve...</small>
            </div>
          </div>

          {/* WIDGET 3: Recursos (Fake) */}
          <div className={styles.widget} style={{background: 'linear-gradient(45deg, #2c3e50, #000)'}}>
             <h3 className={styles.widgetTitle} style={{color:'#fff'}}>📚 Aprenda</h3>
             <p style={{fontSize:'0.9rem', color:'#ccc', marginBottom:'10px'}}>
               Confira nossa seleção de tutoriais para iniciantes.
             </p>
             <button style={{
                 width:'100%', 
                 padding:'8px', 
                 background:'#007bff', 
                 border:'none', 
                 color:'white', 
                 borderRadius:'4px',
                 cursor: 'pointer'
             }}>
                 Ver Tutoriais
             </button>
          </div>

        </aside>

      </main>
    </div>
  );
}
TelaInicial.noHeader = true;