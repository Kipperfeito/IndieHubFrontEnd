  import style from './style.module.css'
  import { useState, useEffect } from 'react';

  export default function Header() {
    return (
      <nav className={style.header}>
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
