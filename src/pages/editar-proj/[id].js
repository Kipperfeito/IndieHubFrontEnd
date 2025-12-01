import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import VagaCard from '@/components/VagaCard'; 
import editStyles from './editar.module.css'; 
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> );

export default function ProjetoDetalhe() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth(); 

    const [projeto, setProjeto] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false); 
    
    const [vagas, setVagas] = useState([]); 
    const [mediaLista, setMediaLista] = useState([]); 
    const [colaboradorIds, setColaboradorIds] = useState([]);

    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
    const [novaVaga, setNovaVaga] = useState({ vagatitulo: '', vagadesc: '', vagarequisitos: '' });
    const tagsDisponiveis = [ 'C#', 'Unity', 'Music Producer', 'JavaScript', 'React', 'SQL', 'Node.js', 'UX Design', 'UI Design' ];
    const [mediaTipo, setMediaTipo] = useState('imagem');
    const [mediaUrl, setMediaUrl] = useState('');

    const isOwner = user && projeto && user.id === projeto.ownerId;

    const fetchData = () => {
        if (id && user) {
            setLoading(true);
            const projetoRequest = api.get(`/projetos/${id}`);
            const usuariosRequest = api.get("/usuarios");

            Promise.all([projetoRequest, usuariosRequest])
                .then(([resProjeto, resUsuarios]) => {
                    const data = resProjeto.data;

                    // VERIFICAÇÃO DE DONO
                    if (user && data.ownerId !== user.id) {
                        setError("Você não tem permissão para editar este projeto.");
                        return;
                    }

                    // Popula todos os estados com os dados do backend
                    setProjeto(data);
                    setVagas(data.vagas || []);
                    setMediaLista(data.projmedia || []);
                    setColaboradorIds(data.colaboradores ? data.colaboradores.map(c => c.id) : []);

                    // Filtra a lista de usuários para o <select> de colaboradores
                    const outrosUsuarios = resUsuarios.data.filter(u => u.id !== user.id);
                    setUsuariosDisponiveis(outrosUsuarios);
                })
                .catch(err => setError("Não foi possível carregar os dados."))
                .finally(() => setLoading(false));
        }
    };


   useEffect(() => {
        fetchData();
    }, [id, user]); 

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setProjeto(prev => ({ ...prev, [name]: value }));
    };
    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setProjeto(prev => ({
            ...prev,
            projlinks: { ...prev.projlinks, [name]: value }
        }));
    };

    const handleCancelEdit = () => {
        fetchData();
        router.push(`/tela-proj/${projeto.id}`)
    };
    const handleNovaVagaChange = (e) => {
        setNovaVaga({ ...novaVaga, [e.target.name]: e.target.value });
    };
    const handleAddVaga = () => {
        if (!novaVaga.vagatitulo || !novaVaga.vagadesc) {
            alert("Preencha a Tag e a Descrição da vaga.");
            return;
        }
        const vagaComIdTemp = { ...novaVaga, id: `temp_${Math.random()}` };
        setVagas([...vagas, vagaComIdTemp]); 
        setNovaVaga({ vagatitulo: '', vagadesc: '', vagarequisitos: '' });
    };
    const handleDeleteVaga = (vagaId) => {
        setVagas(vagas.filter(v => v.id !== vagaId));
    }
    
    const handleAddMedia = () => {
        if (!mediaUrl) return;
        setMediaLista([...mediaLista, { tipo: mediaTipo, url: mediaUrl }]);
        setMediaUrl('');
    };

    const handleRemoveMedia = (url) => {
        setMediaLista(mediaLista.filter(m => m.url !== url));
    };
    const handleColaboradorToggle = (id) => {
        const idNum = parseInt(id);
        if (colaboradorIds.includes(idNum)) {
            setColaboradorIds(colaboradorIds.filter(cid => cid !== idNum));
        } else {
            setColaboradorIds([...colaboradorIds, idNum]);
        }
    };
     const handleSaveProject = () => {
        setIsSaving(true);
        const { projtitulo, projdesc, projlinks, projestagioatual, projmodelonegocio, projplataforma } = projeto;
        
        const payload = {
            projtitulo, projdesc, projlinks, projestagioatual, projmodelonegocio, projplataforma,
            projmedia: mediaLista,
            colaboradores: colaboradorIds,
            vagas: vagas
        };

        console.log("Enviando payload:", payload);
        api.put(`/projetos/${id}`, payload)
            .then(() => {
                router.push(`/tela-proj/${id}`); 
            })
            .catch(err => {
                console.error("Erro ao salvar:", err);
                setError("Erro ao salvar projeto. Tente novamente.");
            })
            .finally(() => setIsSaving(false));
    };
    if (loading || authLoading) {
        return <div className={editStyles.container}><p>Carregando...</p></div>;
    }
    if (error) {
        return (
            <div className={editStyles.container}>
                <p className={editStyles.errorMessage}>{error}</p>
                <Link href={`/tela-proj/${id}`} className={editStyles.btnSecondary}>
                    Voltar para Visualização
                </Link>
            </div>
        ); 
    }
    if (!projeto) {
        return <div className={editStyles.container}><p>Projeto não encontrado.</p></div>;
    }
    
    const links = projeto.projlinks || {};

    return (
        <>
            <div className={editStyles.container}>
            {/* --- BARRA DE AÇÕES (Salvar/Cancelar) --- */}
            <div className={editStyles.ownerActions}>
                <button onClick={handleCancelEdit} className={editStyles.btnSecondary} disabled={isSaving}>
                    Cancelar Edição
                </button>
                <button onClick={handleSaveProject} className={editStyles.btnPrimary} disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>

            {/* --- FORMULÁRIO PRINCIPAL --- */}
            <main className={editStyles.mainContent}>
                <label>Título do Projeto:</label>
                <input 
                    type="text" 
                    name="projtitulo" 
                    value={projeto.projtitulo} 
                    onChange={handleProjectChange}
                    className={editStyles.titleInput} 
                />

                <label>Descrição:</label>
                <textarea
                    name="projdesc"
                    value={projeto.projdesc}
                    onChange={handleProjectChange}
                    className={editStyles.descriptionTextarea} 
                    rows="8"
                />
            
                <section className={editStyles.links}>
                    <h2>Links</h2>
                    <div className={editStyles.linksEditGrid}>
                        <label>GitHub:</label>
                        <input type="url" name="github" value={links.github || ''} onChange={handleLinkChange} />
                        <label>Itch.io:</label>
                        <input type="url" name="itchio" value={links.itchio || ''} onChange={handleLinkChange} />
                        <label>Website:</label>
                        <input type="url" name="website" value={links.website || ''} onChange={handleLinkChange} />
                    </div>
                </section>

                <hr className={editStyles.divider} />

                {/* --- NOVA SEÇÃO: GERENCIAR MÍDIA --- */}
                <section className={editStyles.mediaSection}>
                    <h2>Gerenciar Mídia</h2>
                    <div className={editStyles.addMediaBox}>
                        <h4>Adicionar Nova Mídia</h4>
                        <div className={editStyles.inputWithButton}>
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
                            <button type="button" onClick={handleAddMedia} className={editStyles.btnSecondary}>
                                + Adicionar
                            </button>
                        </div>
                    </div>
                    
                    <div className={editStyles.mediaPreviewList}>
                        {mediaLista.length === 0 ? (
                            <p className={editStyles.emptyState}>Nenhuma mídia adicionada.</p>
                        ) : (
                            mediaLista.map((item, index) => (
                                <div key={index} className={editStyles.mediaPreviewItem}>
                                    <span className={editStyles.mediaType}>{item.tipo}</span>
                                    <span className={editStyles.mediaUrl}>{item.url}</span>
                                    <button onClick={() => handleRemoveMedia(item.url)} className={editStyles.btnRemove}>
                                        Remover
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <hr className={editStyles.divider} />

                <section className={editStyles.colaboradoresSection}>
                    <h2>Gerenciar Colaboradores</h2>
                    <div className={editStyles.checkboxList}>
                        {usuariosDisponiveis.length > 0 ? (
                            usuariosDisponiveis.map(u => (
                                <label key={u.id} className={editStyles.checkboxItem}>
                                    <input 
                                        type="checkbox"
                                        checked={colaboradorIds.includes(u.id)}
                                        onChange={() => handleColaboradorToggle(u.id)}
                                    />
                                    {u.usunome}
                                </label>
                            ))
                        ) : (
                            <p className={editStyles.emptyState}>Nenhum outro usuário encontrado.</p>
                        )}
                    </div>
                </section>

                <hr className={editStyles.divider} />
                
                <section className={editStyles.vagasSection}>
                    <h2>Gerenciar Vagas</h2>
                    <div className={editStyles.addVagaBox}>
                        <h4>Adicionar Nova Vaga</h4>
                        
                        <label>Tag / Função:</label>
                        <select 
                            name="vagatitulo" 
                            value={novaVaga.vagatitulo} 
                            onChange={handleNovaVagaChange} 
                            className={editStyles.select}
                        >
                            <option value="">Selecione...</option>
                            {tagsDisponiveis.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                        </select>

                        <label>Descrição Curta:</label>
                        <input 
                            type="text" 
                            name="vagadesc" 
                            value={novaVaga.vagadesc} 
                            onChange={handleNovaVagaChange} 
                            className={editStyles.input} 
                            placeholder="Ex: Programar IA dos inimigos"
                        />

                        <label>Requisitos:</label>
                        <input 
                            type="text" 
                            name="vagarequisitos" 
                            value={novaVaga.vagarequisitos} 
                            onChange={handleNovaVagaChange} 
                            className={editStyles.input} 
                            placeholder="Ex: Exp. com Unity e C#"
                        />

                        <button type="button" onClick={handleAddVaga} className={editStyles.btnSecondary} style={{marginTop: '1rem'}}>
                            + Adicionar Vaga
                        </button>
                    </div>
                    
                    <div className={editStyles.vagasGridEdit}>
                        {vagas.length > 0 ? (
                            vagas.map(vaga => (
                                <div key={vaga.id} className={editStyles.vagaItem}>
                                    <VagaCard vaga={vaga} /> 
                                    <button 
                                        onClick={() => handleDeleteVaga(vaga.id)} 
                                        className={editStyles.btnRemoveVaga}
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>Nenhuma vaga aberta no momento.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
        </>
    );
}