import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client'; 
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import styles from './chat.module.css';
import Link from 'next/link';

// Ícone de Enviar
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const Avatar = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatarPequeno} />;
    }
    // Fallback estilo WhatsApp
    return (
        <div className={styles.avatarFallback}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};
const AvatarO = ({ usufoto, usunome }) => {
    if (usufoto) {
        return <img src={usufoto} alt={usunome} className={styles.avatarPequeno} />;
    }
    // Fallback estilo WhatsApp
    return (
        <div className={styles.avatarPequeno}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
};
// URL do seu backend onde o Socket.io está rodando
const SOCKET_URL = 'http://localhost:8080'; 

export default function Chat() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { amigoId } = router.query;

    const [amigos, setAmigos] = useState([]);
    const [amigoSelecionado, setAmigoSelecionado] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState('');

    const socketRef = useRef();
    const scrollRef = useRef(); // Para rolar o chat para baixo automaticamente

    // 1. Conectar no Socket.io e Carregar Amigos ao entrar na página
    useEffect(() => {
        if (!user) return;

        // Carrega a lista de amigos para a barra lateral
        api.get('/amizades').then(res => {
            setAmigos(res.data);
            if (amigoId) {
                const amigoAlvo = res.data.find(a => a.id === parseInt(amigoId));
                if (amigoAlvo) {
                    selecionarAmigo(amigoAlvo);
                }
            }
        })
        socketRef.current = io(SOCKET_URL);

        // Entra na "sala" exclusiva do usuário para receber mensagens privadas
        socketRef.current.emit("entrar_chat", user.id);

        // Escuta mensagens chegando em tempo real
        socketRef.current.on("receber_mensagem", (msgRecebida) => {
            // Só adiciona na tela se a mensagem for do amigo que estou conversando agora
            setMensagens((prev) => {
                // Precisamos verificar o estado atual de 'amigoSelecionado'
                // Como dentro do listener o state pode estar desatualizado, 
                // vamos confiar que o usuário filtrará visualmente ou usaremos um ref se necessário.
                // Para simplificar: adicionamos a mensagem.
                return [...prev, msgRecebida];
            });
        });

        // Limpa a conexão ao sair da página
        return () => socketRef.current.disconnect();
    }, [user, amigoId]);

    // 2. Rolar para baixo sempre que chegar mensagem nova
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    const selecionarAmigo = async (amigo) => {
        setAmigoSelecionado(amigo);
        setMensagens([]); // Limpa chat anterior visualmente

        try {
            const res = await api.get(`/mensagens/${amigo.id}`);
            setMensagens(res.data);
        } catch (err) {
            console.error("Erro ao carregar histórico", err);
        }
    };

    // 4. Enviar Mensagem
    const enviarMensagem = (e) => {
        e.preventDefault();
        if (!texto.trim() || !amigoSelecionado) return;

        const novaMsg = {
            remetenteId: user.id,
            destinatarioId: amigoSelecionado.id,
            conteudo: texto,
            createdAt: new Date().toISOString() // Para exibir imediatamente
        };

        // Envia para o servidor (Socket)
        socketRef.current.emit("enviar_mensagem", novaMsg);

        // Adiciona na minha tela imediatamente (sem esperar o servidor)
        setMensagens((prev) => [...prev, novaMsg]);
        setTexto('');
    };

    if (loading) return <p>Carregando...</p>;
    if (!user) return null; // O AuthContext redireciona

    return (
        <div className={styles.chatContainer}>
            
            {/* --- BARRA LATERAL (Lista de Amigos) --- */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Mensagens</h2>
                </div>
                <div className={styles.amigosList}>
                    {amigos.map(amigo => (
                        <div 
                            key={amigo.id} 
                            className={`${styles.amigoItem} ${amigoSelecionado?.id === amigo.id ? styles.active : ''}`}
                            onClick={() => selecionarAmigo(amigo)}
                        >
                            <Avatar usufoto={amigo.usufoto} usunome={amigo.usunome}/>
                            <div className={styles.amigoInfo}>
                                <strong>{amigo.usunome}</strong>
                                <span className={styles.status}>{amigo.usudisponibilidade || "Disponível"}</span>
                            </div>
                        </div>
                    ))}
                    {amigos.length === 0 && <p className={styles.empty}>Adicione amigos para conversar!</p>}
                </div>
            </div>

            {/* --- ÁREA DE CONVERSA --- */}
            <div className={styles.chatArea}>
                {amigoSelecionado ? (
                    <>
                        {/* Cabeçalho do Chat */}
                        <div className={styles.chatHeader}>
                            <AvatarO usufoto={amigoSelecionado.usufoto} usunome={amigoSelecionado.usunome}/>
                            <h3>{amigoSelecionado.usunome}</h3>
                            <Link href={`/perfil/${amigoSelecionado.id}`} className={styles.linkPerfil}>
                                Ver Perfil
                            </Link>
                        </div>

                        {/* Lista de Mensagens */}
                        <div className={styles.messagesList}>
                            {mensagens
                                // Filtra apenas mensagens entre eu e o amigo selecionado (segurança visual)
                                .filter(m => 
                                    (m.remetenteId === user.id && m.destinatarioId === amigoSelecionado.id) ||
                                    (m.remetenteId === amigoSelecionado.id && m.destinatarioId === user.id)
                                )
                                .map((msg, index) => {
                                    const souEu = msg.remetenteId === user.id;
                                    return (
                                        <div key={index} className={`${styles.messageBubble} ${souEu ? styles.me : styles.them}`}>
                                            <p>{msg.conteudo}</p>
                                            <span className={styles.time}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })
                            }
                            <div ref={scrollRef} /> {/* Elemento invisível para rolar até aqui */}
                        </div>

                        {/* Input de Envio */}
                        <form onSubmit={enviarMensagem} className={styles.inputArea}>
                            <input 
                                type="text" 
                                placeholder="Digite uma mensagem..." 
                                value={texto}
                                onChange={e => setTexto(e.target.value)}
                            />
                            <button type="submit" className={styles.sendButton}>
                                <SendIcon />
                            </button>
                        </form>
                    </>
                ) : (
                    // Tela de "Selecione um amigo"
                    <div className={styles.noChatSelected}>
                        <h3>Selecione um amigo para começar a conversar</h3>
                        <p>Suas conversas são privadas e seguras.</p>
                    </div>
                )}
            </div>
        </div>
    );
}