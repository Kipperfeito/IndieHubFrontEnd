  import style from '../HeaderLog/style.module.css'
  import { useState, useRef } from 'react';
  import { useAuth } from '@/context/AuthContext';
  import { useRouter } from "next/router";


  export default function Header() {
    const { user } = useAuth();
    const router = useRouter();
    
    function CrieProjeto() {
      if (!user || !user.id) {
        alert("Você precisa estar logado para criar um projeto.");
        router.push('/login');
        return;
      }
    }
    return (
      <>
      <nav className={style.header}>
        <ul className={style.menu}>
          <li className={style.menuItem}>
            <a href="/"><img className={style.logo} src="logoIndie.png" alt="Logo Indie" /></a>
          </li>
          <li className={style.motivacao}>
            <a onClick={CrieProjeto}>Crie seu Projeto</a>
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
