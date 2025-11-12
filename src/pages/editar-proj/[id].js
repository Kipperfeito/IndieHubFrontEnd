import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css"; 
import api from "@/services/api";
import { useAuth } from '@/context/AuthContext';

export default function EditarProjeto() {
    const router = useRouter();
    const { id } = router.query; 
    const { user } = useAuth();

    const [etapa, setEtapa] = useState(1);
    
    const [projeto, setProjeto] = useState({
        projtitulo: '',
        projdesc: '',
        projestagioatual: '',
        projmodelonegocio: '',
        projplataforma: '',
        colaboradores: [] 
    });
    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
    const [mediaLista, setMediaLista] = useState([]);
    const [links, setLinks] = useState({
        github: '',
        itchio: '',
        website: ''
    });
    const [mediaTipo, setMediaTipo] = useState('imagem');
    const [mediaUrl, setMediaUrl] = useState('');

    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        if (id && user) {
            setLoading(true);

            api.get(`/projetos/${id}`)
                .then(res => {
                    const data = res.data;

                    if (data.ownerId !== user.id) {
                        setErro("Você não tem permissão para editar este projeto.");
                        router.push("/meus-projetos"); 
                        return;
                    }

                    setProjeto({
                        projtitulo: data.projtitulo || '',
                        projdesc: data.projdesc || '',
                        projestagioatual: data.projestagioatual || '',
                        projmodelonegocio: data.projmodelonegocio || '',
                        projplataforma: data.projplataforma || '',
                        colaboradores: data.colaboradores ? data.colaboradores.map(c => c.id) : []
                    });
                    setLinks(data.projlinks || { github: '', itchio: '', website: '' });
                    setMediaLista(data.projmedia || []);
                })
                .catch(err => {
                    console.error("Erro ao buscar projeto:", err);
                    setErro("Não foi possível carregar os dados do projeto.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id, user]); // Roda de novo se o ID ou o usuário mudarem

    useEffect(() => {
        if (user && user.id) {
            api.get("/usuarios")
                .then(res => {
                    const outrosUsuarios = res.data.filter(u => u.id !== user.id);
                    setUsuariosDisponiveis(outrosUsuarios);
                })
                .catch(err => {
                    console.error("Erro ao buscar usuários:", err);
                });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjeto({ ...projeto, [name]: value });
    };

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setLinks(prevLinks => ({ ...prevLinks, [name]: value }));
    };

    const handleColaboradorToggle = (idUsuario) => {
        setProjeto(prevProjeto => {
            const jaSelecionado = prevProjeto.colaboradores.includes(idUsuario);
            let novosColaboradores;
            if (jaSelecionado) {
                novosColaboradores = prevProjeto.colaboradores.filter(id => id !== idUsuario);
            } else {
                novosColaboradores = [...prevProjeto.colaboradores, idUsuario];
            }
            return { ...prevProjeto, colaboradores: novosColaboradores };
        });
    };
    
    const handleAddMedia = (e) => {
        e.preventDefault(); 
        if (!mediaUrl) { setErro("Por favor, cole uma URL."); return; }
        setMediaLista([...mediaLista, { tipo: mediaTipo, url: mediaUrl }]);
        setMediaUrl('');
        setErro('');
    };
    
    const handleRemoveMedia = (urlParaRemover) => {
        setMediaLista(mediaLista.filter(item => item.url !== urlParaRemover));
    };

    const proximaEtapa = () => {
        setErro('');
        if (etapa === 1 && (!projeto.projtitulo || !projeto.projdesc)) {
            setErro("Por favor, preencha o nome e a descrição do projeto.");
            return;
        }
        if (etapa === 2 && (!projeto.projestagioatual || !projeto.projmodelonegocio || !projeto.projplataforma)) {
            setErro("Por favor, preencha todos os detalhes do projeto.");
            return;
        }
        setEtapa(etapa + 1);
    };

    const etapaAnterior = () => {
        setErro('');
        setEtapa(etapa - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');

        const dadosParaEnviar = {
            ...projeto,
            projlinks: links,
            projmedia: mediaLista
        };

        console.log("Atualizando projeto com:", dadosParaEnviar);
        api.put(`/projetos/${id}`, dadosParaEnviar) 
            .then((res) => {
                alert("Projeto atualizado com sucesso!");
                router.push(`/tela-proj/${id}`); 
            })
            .catch((err) => {
                console.error(err);
                const mensagemErro = err?.response?.data?.message ?? err.message;
                setErro(`Ocorreu um erro ao atualizar: ${mensagemErro}`);
            });
    };
    
    if (loading) {
        return <div className={styles.container}><p>Carregando dados do projeto...</p></div>;
    }

    if (erro) {
        return <div className={styles.container}><p className={styles.erro}>{erro}</p></div>;
    }

    return (
        <>
            <div className={styles.container}>
                <h3>Editando: {projeto.projtitulo} (Etapa {etapa}/5)</h3>
                {erro && <p className={styles.erro}>{erro}</p>}
                <form onSubmit={handleSubmit} className={styles.formCadastro}>
                    {etapa === 1 && (
                        <>
                            <h4>Etapa 1: Informações Básicas</h4>
                            <label htmlFor="projtitulo">Título do Projeto: </label>
                            <input type="text" id="projtitulo" name="projtitulo" value={projeto.projtitulo} onChange={handleChange} />
                            <br />
                            <label htmlFor="projdesc">Descrição do Projeto: </label>
                            <textarea id="projdesc" name="projdesc" rows="5" value={projeto.projdesc} onChange={handleChange} />
                            <br />
                            <button type="button" onClick={proximaEtapa}>Avançar</button>
                        </>
                    )}
                    {etapa === 2 && (
                        <>
                            <h4>Etapa 2: Detalhes do Projeto</h4>
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
                            <br/>
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" onClick={proximaEtapa}>Avançar</button>
                            </div>
                        </>
                    )}

                    {etapa === 3 && (
                        <>
                            <h4>Etapa 3: Adicionar Colaboradores (Opcional)</h4>
                            <div className={styles.checkboxList}>
                                {usuariosDisponiveis.map(usuario => (
                                    <div key={usuario.id} className={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            id={`user-${usuario.id}`}
                                            checked={projeto.colaboradores.includes(usuario.id)}
                                            onChange={() => handleColaboradorToggle(usuario.id)}
                                        />
                                        <label htmlFor={`user-${usuario.id}`}>{usuario.usunome}</label>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" onClick={proximaEtapa}>Avançar</button>
                            </div>
                        </>
                    )}

                    {etapa === 4 && (
                        <>
                            <h4>Etapa 4: Mídia do Projeto (Opcional)</h4>
                            <div className={styles.mediaInputGroup}>
                                <select value={mediaTipo} onChange={(e) => setMediaTipo(e.target.value)}>
                                    <option value="imagem">Imagem</option>
                                    <option value="video">Vídeo (YouTube)</option>
                                </select>
                                <input type="text" placeholder="Cole a URL aqui..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                                <button type="button" onClick={handleAddMedia} className={styles.btnSecondary}>Adicionar</button>
                            </div>
                            <div className={styles.mediaPreviewList}>
                                {mediaLista.length === 0 && <p className={styles.emptyState}>Nenhuma mídia adicionada.</p>}
                                {mediaLista.map((item, index) => (
                                    <div key={index} className={styles.mediaPreviewItem}>
                                        <span><strong>{item.tipo}:</strong> {item.url}</span>
                                        <button type="button" onClick={() => handleRemoveMedia(item.url)} className={styles.btnRemove}>Remover</button>
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
                            <label htmlFor="github">GitHub:</label>
                            <input type="url" id="github" name="github" placeholder="https://github.com/..." value={links.github} onChange={handleLinkChange} />
                            <br />
                            <label htmlFor="itchio">Itch.io:</label>
                            <input type="url" id="itchio" name="itchio" placeholder="https://usuario.itch.io/..." value={links.itchio} onChange={handleLinkChange} />
                            <br />
                            <label htmlFor="website">Website / Outro:</label>
                            <input type="url" id="website" name="website" placeholder="https://seusite.com/..." value={links.website} onChange={handleLinkChange} />
                            <br />
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={etapaAnterior}>Voltar</button>
                                <button type="submit" className={styles.btnPrimary}>Atualizar Projeto</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}