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
        </ul>
        <div className="nav-links">
            <a href="/login" className="btn btn-secondary">
              Entrar
            </a>
            <a href="/cadastro-usu" className="btn btn-primary">
              Criar conta
            </a>
          </div>
      </nav>
      </>
    );
  }
