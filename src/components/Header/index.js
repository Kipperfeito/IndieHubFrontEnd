import style from './style.module.css'
import { useState, useEffect } from 'react';


export default function Header() {
    
  // Define o estado inicial já verificando o tema, para evitar uma "piscada" na tela
  const [headerClass, setHeaderClass] = useState(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? style.headerDark : style.headerLight;
    }
    // Retorno padrão caso o código rode no servidor (Next.js, etc.)
    return style.headerLight;
  });

  useEffect(() => {
    // 1. Guarda a consulta de mídia em uma variável para poder adicionar e remover o listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 2. Cria uma função para lidar com a mudança
    const handleChange = (e) => {
      setHeaderClass(e.matches ? style.headerDark : style.headerLight);
    };

    // 3. Adiciona o "ouvinte" para o evento de mudança
    mediaQuery.addEventListener('change', handleChange);

    // 4. Retorna uma função de "limpeza" (cleanup)
    // Isso é MUITO importante: remove o ouvinte quando o componente "morrer" (unmount)
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []); // O array vazio [] garante que este useEffect rode apenas uma vez (para configurar o listener)

  return (
    <nav className={headerClass}>
      <ul className={style.menu}>
        <li className={style.menuItem}>
          <a href="/"><img className={style.logo} src="logoIndie.png" alt="Logo Indie" /></a>
        </li>
        <li className={style.menuItem}><a href="/perfil">Perfil</a></li>
        <li className={style.menuItem}><a href="/projetos">Projetos</a></li>
        <li className={style.menuItem}><a href="/tags">Tags</a></li>
      </ul>
    </nav>
  );
}
