import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css"; 
import api from "@/services/api";
import { useAuth } from '@/context/AuthContext';

export default function CadastroProjeto() {
    const router = useRouter();

    const [etapa, setEtapa] = useState(1);
    const [projeto, setProjeto] = useState({
        projtitulo: '',
        projdesc: '',
        projestagioatual: '',
        projmodelonegocio: '',
        projplataforma: '',
        projdatapublicacao: '',
        colaboradores: [] 
    });
    const [amigos, setAmigos] = useState([]);
    const [erro, setErro] = useState('');

    const [mediaLista, setMediaLista] = useState([]);
    const [mediaTipo, setMediaTipo] = useState('imagem');
    const [mediaUrl, setMediaUrl] = useState('');

    const { user } = useAuth();

    const [links, setLinks] = useState({
        github: '',
        itchio: '',
        website: ''
    });
    
    useEffect(() => {
        if(user && user.id) {
            api.get("/amizades") 
                .then(res => {
                    console.log("MEUS AMIGOS:", res.data);
                    setAmigos(res.data);
                })
                .catch(err => {
                    console.error("Erro ao buscar usuários:", err);
                    setErro("Não foi possível carregar a lista de amigos.");
                });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjeto({ ...projeto, [name]: value });
    };

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setLinks(prevLinks => ({
            ...prevLinks,
            [name]: value
        }));
    };

    const handleColaboradorToggle = (idUsuario) => {
        setProjeto(prevProjeto => {
            const jaSelecionado = prevProjeto.colaboradores.includes(idUsuario);
            let novosColaboradores;

            if (jaSelecionado) {
                // Se já estava no array, remove
                novosColaboradores = prevProjeto.colaboradores.filter(id => id !== idUsuario);
            } else {
                // Se não estava, adiciona
                novosColaboradores = [...prevProjeto.colaboradores, idUsuario];
            }
            
            return { ...prevProjeto, colaboradores: novosColaboradores };
        });
    };

    //Funções de navegação entre etapas
    const proximaEtapa = () => {
        setErro(''); // Limpa erros antigos

        if (etapa === 1) {
            if (!projeto.projtitulo || !projeto.projdesc) {
                setErro("Por favor, preencha o nome e a descrição do projeto.");
                return; 
            }
        }
        if (etapa === 2) {
            // Validação da Etapa 2
            if (!projeto.projestagioatual || !projeto.projmodelonegocio || !projeto.projplataforma) {
                setErro("Por favor, preencha todos os detalhes do projeto (Estágio, Modelo e Plataforma).");
                return;
            }
        }
        setEtapa(etapa + 1);
    };

    const etapaAnterior = () => {
        setErro(''); // Limpa erros ao voltar
        setEtapa(etapa - 1);
    };

    const handleAddMedia = (e) => {
        e.preventDefault(); // Impede o submit do formulário
        if (!mediaUrl) {
            setErro("Por favor, cole uma URL.");
            return;
        }
        
        // Adiciona a nova mídia à lista
        setMediaLista([
            ...mediaLista, 
            { tipo: mediaTipo, url: mediaUrl }
        ]);
        setMediaUrl('');
        setErro('');
    };
    
    const handleRemoveMedia = (urlParaRemover) => {
        setMediaLista(mediaLista.filter(item => item.url !== urlParaRemover));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');
        //VERIFICAÇÃO DE LOGIN
        if (!user || !user.id) {
            setErro("Você precisa estar logado para criar um projeto.");
            router.push('/login');
            return;
        }

        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];

        const dadosParaEnviar = {
            ...projeto,
            projdatapublicacao: dataFormatada,
            ownerId: user.id,
            colaboradores: projeto.colaboradores,
            projmedia: mediaLista,
            projlinks: links
        };

        console.log("Enviando para a API:", dadosParaEnviar);

        api
            .post("/projetos", dadosParaEnviar) 
            .then((res) => {
                console.log(res.data);
                alert("Projeto salvo com sucesso!");
                router.push("/inicial"); 
            })
            .catch((err) => {
                console.error(err);
                const mensagemErro = err?.response?.data?.message ?? err.message;
                setErro(`Ocorreu um erro ao salvar: ${mensagemErro}`);
            });
    };

    return (
        <>
            <div className={styles.container}>
                <h3>Formulário de Cadastro de Projeto</h3>
                
                {erro && <p className={styles.erro}>{erro}</p>}

                <form onSubmit={handleSubmit} className={styles.formCadastro}>
                    
                    {/* ETAPA 1: Informações Básicas */}
                    {etapa === 1 && (
                        <>
                            <label htmlFor="projtitulo">Nome do Projeto: </label>
                            <input 
                                type="text" 
                                id="projtitulo" 
                                name="projtitulo" 
                                maxLength="70" 
                                value={projeto.projtitulo} 
                                onChange={handleChange} 
                            />
                            <br />

                            <label htmlFor="projdesc">Descrição do Projeto: </label>
                            <textarea 
                                id="projdesc" 
                                name="projdesc" 
                                rows="5"
                                maxLength="500"
                                className={styles.textarea}
                                value={projeto.projdesc} 
                                onChange={handleChange} 
                            />
                            <br />
                            
                            {/* Botão único de avançar */}
                            <button type="button" onClick={proximaEtapa}>Avançar</button>
                        </>
                    )}

                    {/* ETAPA 2: Detalhes do Projeto */}
                    {etapa === 2 && (
                        <>
                            <label htmlFor="projestagioatual">Estágio Atual:</label>
                            <select id="projestagioatual" name="projestagioatual" value={projeto.projestagioatual} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="Conceito">Conceito</option>
                                <option value="Protótipo">Protótipo</option>
                                <option value="Desenvolvimento (Alpha/Beta)">Desenvolvimento (Alpha/Beta)</option>
                                <option value="Lançado">Lançado</option>
                                <option value="Pausado">Pausado</option>
                            </select>
                            <br />

                            <label htmlFor="projmodelonegocio">Modelo de Negócio:</label>
                            <select id="projmodelonegocio" name="projmodelonegocio" value={projeto.projmodelonegocio} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="Premium (Preço Único)">Premium (Preço Único)</option>
                                <option value="Free-to-play (c/ Microtransações)">Free-to-play (c/ Microtransações)</option>
                                <option value="Assinatura (SaaS)">Assinatura (SaaS)</option>
                                <option value="Freemium">Freemium</option>
                                <option value="Outro">Outro</option>
                            </select>
                            <br />

                            <label htmlFor="projplataforma">Plataforma Principal:</label>
                            <select id="projplataforma" name="projplataforma" value={projeto.projplataforma} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="PC">PC (Steam, Epic, etc.)</option>
                                <option value="Web">Web (Navegador)</option>
                                <option value="Mobile (Android/iOS)">Mobile (Android/iOS)</option>
                                <option value="Console">Console (PlayStation, Xbox, Switch)</option>
                                <option value="Misto/Multiplataforma">Misto/Multiplataforma</option>
                            </select>
                            <br />

                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" onClick={proximaEtapa}>Avançar</button>
                            </div>
                        </>
                    )}
                   {etapa === 3 && (
                        <>
                            <h4>Etapa 3: Adicionar Colaboradores</h4>
                            <p>Selecione quem vai trabalhar com você neste projeto.</p>
                            
                            <div className={styles.checkboxList}>
                                {amigos.length > 0 ? (
                                    amigos.map(usuario => (
                                        <div 
                                            key={usuario.id} 
                                            className={styles.checkboxItem}
                                            // Permite clicar na div inteira para selecionar
                                            onClick={() => handleColaboradorToggle(usuario.id)}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '5px' }}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`user-${usuario.id}`}
                                                // O "checked" controla o visual
                                                checked={projeto.colaboradores.includes(usuario.id)}
                                                // O onChange vazio evita erro de React (controlled input), 
                                                // já que o onClick da div gerencia a troca.
                                                onChange={() => {}} 
                                                style={{ pointerEvents: 'none' }} // Deixa o clique passar para a div
                                            />
                                            <label 
                                                htmlFor={`user-${usuario.id}`}
                                                style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                            >
                                                {/* Garante que mostre algo mesmo se usunome falhar */}
                                                {usuario.usunome || usuario.nome || "Usuário sem nome"}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', background: '#f0f0f0' }}>
                                        <p>Você ainda não tem conexões adicionadas.</p>
                                        <small>Vá até a aba "Conexões" para adicionar amigos antes de criar o projeto.</small>
                                    </div>
                                )}
                            </div>

                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" onClick={proximaEtapa}>Avançar</button>
                            </div>
                        </>
)}
                    {etapa === 4 && (
                        <>
                            <h4>Etapa 4: Mídia do Projeto</h4>
                            <p>Adicione links de imagens (Imgur, etc.) e vídeos (YouTube).</p>

                            <div className={styles.mediaInputGroup}>
                                <select value={mediaTipo} onChange={(e) => setMediaTipo(e.target.value)}>
                                    <option value="imagem">Imagem</option>
                                    <option value="video">Vídeo (YouTube)</option>
                                </select>
                                <input 
                                    type="text"
                                    placeholder="Cole a URL aqui..."
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                />
                                <button type="button" onClick={handleAddMedia}>Adicionar</button>
                            </div>

                            {/* Lista de mídias já adicionadas */}
                            <div className={styles.mediaPreviewList}>
                                {mediaLista.length === 0 && <p>Nenhuma mídia adicionada.</p>}
                                {mediaLista.map((item, index) => (
                                    <div key={index} className={styles.mediaPreviewItem}>
                                        <span><strong>{item.tipo}:</strong> {item.url.substring(0, 40)}...</span>
                                        <button type="button" onClick={() => handleRemoveMedia(item.url)}>Remover</button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" onClick={proximaEtapa}>Avançar</button>
                            </div>
                        </>
                    )}
                    {etapa === 5 && (
                        <>
                            <h4>Etapa 5: Links (Opcional)</h4>
                            <p>Cole os links relevantes para o seu projeto.</p>

                            <label htmlFor="github">GitHub:</label>
                            <input
                                type="url" 
                                id="github"
                                name="github"
                                placeholder="https://github.com/seu-usuario/projeto"
                                value={links.github}
                                onChange={handleLinkChange}
                            />
                            <br />

                            <label htmlFor="itchio">Itch.io:</label>
                            <input
                                type="url"
                                id="itchio"
                                name="itchio"
                                placeholder="https://seu-usuario.itch.io/jogo"
                                value={links.itchio}
                                onChange={handleLinkChange}
                            />
                            <br />

                            <label htmlFor="website">Website / Outro:</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                placeholder="https://seusite.com/demo"
                                value={links.website}
                                onChange={handleLinkChange}
                            />
                            <br />

                            {/* Botão de submit final */}
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="submit">Salvar Projeto</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}