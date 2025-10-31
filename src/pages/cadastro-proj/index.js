import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css"; 
import Header from '@/components/HeaderLog';
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
    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
    const [erro, setErro] = useState('');

    const [mediaLista, setMediaLista] = useState([]);
    const [mediaTipo, setMediaTipo] = useState('imagem');
    const [mediaUrl, setMediaUrl] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        api.get("/usuarios") // Assumindo que este é seu endpoint de listagem
            .then(res => {
                // Filtra a lista para NÃO mostrar o próprio dono como opção
                const outrosUsuarios = res.data.filter(user => user.id !== idDoUsuarioLogado);
                setUsuariosDisponiveis(outrosUsuarios);
            })
            .catch(err => {
                console.error("Erro ao buscar usuários:", err);
                setErro("Não foi possível carregar a lista de usuários.");
            });
    }, [idDoUsuarioLogado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjeto({ ...projeto, [name]: value });
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

        if (!user || !user.id) {
            setErro("Você precisa estar logado para criar um projeto.");
            // (Opcional: redirecionar para o login)
            // router.push('/login');
            return;
        }

        const hoje = new Date();
        
        // Formata a data para 'YYYY-MM-DD' (padrão que o Sequelize DATEONLY entende)
        const dataFormatada = hoje.toISOString().split('T')[0];

        const dadosParaEnviar = {
            ...projeto,
            projdatapublicacao: dataFormatada,
            ownerId: user.id,
            colaboradores: projeto.colaboradores,
            projmedia: mediaLista
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
            <Header />
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
                            <h4>Etapa 3: Adicionar Colaboradores (Opcional)</h4>
                            
                            {/* Sugestão de classes de estilo */}
                            <div className={styles.checkboxList}>
                                {usuariosDisponiveis.length > 0 ? (
                                    usuariosDisponiveis.map(usuario => (
                                        <div key={usuario.id} className={styles.checkboxItem}>
                                            <input
                                                type="checkbox"
                                                id={`user-${usuario.id}`}
                                                // Verifica se o ID do usuário está no array 'colaboradores'
                                                checked={projeto.colaboradores.includes(usuario.id)}
                                                onChange={() => handleColaboradorToggle(usuario.id)}
                                            />
                                            <label htmlFor={`user-${usuario.id}`}>{usuario.usunome}</label>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nenhum outro usuário disponível para colaboração.</p>
                                )}
                            </div>

                            {/* Botão de 'submit' agora está na Etapa 3 */}
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
                                <button type="submit">Salvar Projeto</button>
                            </div>
                        </>
                    )}
                </form>

                {/* Bloco de depuração (opcional) */}
                <pre style={{ marginTop: '20px', background: '#eee', padding: '10px', borderRadius: '5px' }}>
                    {JSON.stringify(projeto, null, 2)}
                </pre>
            </div>
        </>
    );
}