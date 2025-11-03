  import style from './style.module.css'
  import { useState, useRef } from 'react';
  import { FiBell } from "react-icons/fi";
  import Link from 'next/link';
  import { useAuth } from '@/context/AuthContext';


  export default function HeaderLog() {
    const [menuAberto, setMenuAberto] = useState(null);
    const { logout, user } = useAuth();
    const timerRef = useRef(null);
    const handleToggle = (menuId) => {
        setMenuAberto(menuAberto === menuId ? null : menuId);
    };
    const handleMouseEnter = (menuId) => {
        clearTimeout(timerRef.current); // Cancela qualquer timer de fechamento pendente
        setMenuAberto(menuId);           // Abre o menu correspondente
    };
    const handleMouseLeave = () => {
        // Agenda o fechamento de qualquer menu que estiver aberto
        timerRef.current = setTimeout(() => {
            setMenuAberto(null);
        }, 500); // 0.5 segundos de delay
    };
    //NOTIFICAÇÕES
    const [hasNotifications, setHasNotifications] = useState(false);

    const checkForNotifications = () => {
        const temNotificacoes = true; 

        if (temNotificacoes) {
            setHasNotifications(true);
        }
    };

    const handleIconClick = () => {
        // Mostra o menu de notificações, etc.
        console.log('Notificações lidas!');
        
        // Limpa o indicador
        setHasNotifications(false);
    };
    return (
      <nav className={style.header}>
        <ul className={style.menu}>
          <li className={style.menuItem}>
            <Link href="/inicial"><img className={style.logo} src="logoIndie.png" alt="Logo Indie" /></Link>
          </li>
          <li
              className={style.dropdown}
              // 4. Usamos as novas funções genéricas no <li> para uma melhor experiência
              onMouseEnter={() => handleMouseEnter('perfil')}
              onMouseLeave={handleMouseLeave}
          >
              <button onClick={() => handleToggle('perfil')} className={style.dropdown_toggle}>
                  Perfil ▼
              </button>
              {/* A condição agora verifica se o estado é igual ao ID 'perfil' */}
                {menuAberto === 'perfil' && (
                    <ul className={style.dropdown_menu}>
                        <li><a href="/perfil">Editar Perfil</a></li>
                        <li><button
                            onClick={logout}
                            className={style.dropdownButtonAsLink}>
                            Logout
                        </button>
                        </li>
                    </ul>
                )}
          </li>
          <li 
            className={style.dropdown}
            onMouseEnter={() => handleMouseEnter('projeto')}
            onMouseLeave={handleMouseLeave}>
                <button onClick={() => handleToggle('projeto')} className={style.dropdown_toggle}>
                  Projeto ▼
                </button>
                {menuAberto === 'projeto' && (
                  <ul className={style.dropdown_menu}>
                      <li><a href="/tela-proj">Editar Projeto</a></li>
                      <li><a href="/cadastro-proj">Criar Projeto</a></li>
                  </ul>
                )}
            </li>
          <li className={style.menuItem}><a href="/tags">Vagas</a></li>
            <li 
                // A mágica acontece aqui:
                className={`
                  ${style.notification_icon} 
                  ${hasNotifications ? style['has-notifications'] : ''}
                `}
                id="notification-bell" 
                onClick={handleIconClick}
            >
                <FiBell/>

                <span className={style.notification_badge}></span>
            </li>

            {/* --- PARA TESTAR --- */}
            {/* Botão de simulação (pode remover depois) */}
            <button 
                onClick={checkForNotifications} 
                style={{ marginLeft: '20px' }}
            >
                Simular Notificação
            </button>
        </ul>
      </nav>
    );
}
