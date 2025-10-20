  import style from './style.module.css'
  import { useState, useRef } from 'react';
  import { FiBell } from "react-icons/fi";


  export default function Header() {
    const [menuAberto, setMenuAberto] = useState(null);
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

    // 4. Lógica para limpar as notificações
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
            <a href="/"><img className={style.logo} src="logoIndie.png" alt="Logo Indie" /></a>
          </li>
          <li
              className={style.dropdown}
              // 4. Usamos as novas funções genéricas no <li> para uma melhor experiência
              onMouseEnter={() => handleMouseEnter('veiculo')}
              onMouseLeave={handleMouseLeave}
          >
              <button onClick={() => handleToggle('veiculo')} className={style.dropdown_toggle}>
                  Perfil ▼
              </button>
              {/* A condição agora verifica se o estado é igual ao ID 'veiculo' */}
              {menuAberto === 'veiculo' && (
                  <ul className={style.dropdown_menu}>
                      <li><a href="/veiculo">Editar Perfil</a></li>
                      <li><a>Logout</a></li>
                  </ul>
              )}
          </li>
          <li className={style.menuItem}><a href="/projetos">Projetos</a></li>
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
