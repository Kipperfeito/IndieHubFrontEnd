  import style from '../HeaderLog/style.module.css'
  import { useState, useRef } from 'react';

  export default function Header() {
    return (
      <>
      <nav className={style.header}>
        <ul className={style.menu}>
          <li className={style.menuItem}>
            <a href="/"><img className={style.logo} src="logoIndie.png" alt="Logo Indie" /></a>
          </li>
          <li className={style.motivacao}>
            <a href='/cadastro-usu'>Crie seu Projeto</a>
          </li>
          <li className={style.nav_links}>
            <a href="/login" className="btn btn-secondary">
              Entrar
            </a>
            <a href="/cadastro-usu" className="btn btn-primary">
              Criar conta
            </a>
          </li>
        </ul>
      </nav>
      </>
    );
  }
