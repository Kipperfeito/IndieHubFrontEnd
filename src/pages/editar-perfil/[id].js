import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import styles from '@/pages/perfil/Perfil.module.css'; // Reutiliza o mesmo CSS
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link'; // Para o botão "Voltar"

// Lista de tags disponíveis (consistente com o cadastro)
const tagsDisponiveis = [
    'C#', 'Unity', 'Music Producer', 'JavaScript', 'React',
    'SQL', 'Node.js', 'UX Design', 'UI Design'
];

export default function EditarPerfil() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth(); 

    // Estado para o formulário
    const [perfil, setPerfil] = useState({
        usunome: '',
        usuemail: '',
        usudatanascimento: '',
        usudisponibilidade: '',
        usuportifolio: '',
        usufoto: '', // Adicionado campo de foto
        usutags: [],
        usuproficiencia: {}
    });
    const [novaSenha, setNovaSenha] = useState(''); 
    
    // Estados de controle
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login'); 
            return;
        }

        setLoading(true);
        api.get(`/usuarios/${user.id}`)
            .then(res => {
                const data = res.data;
                try { data.usutags = JSON.parse(data.usutags) || []; } catch (e) { data.usutags = []; }
                try { data.usuproficiencia = JSON.parse(data.usuproficiencia) || {}; } catch (e) { data.usuproficiencia = {}; }
                
                if (data.usudatanascimento) {
                    data.usudatanascimento = data.usudatanascimento.split('T')[0];
                }

                setPerfil(data);
            })
            .catch(err => {
                console.error(err);
                setError("Não foi possível carregar seu perfil.");
            })
            .finally(() => setLoading(false));

    }, [user, authLoading, router]);

    // --- HANDLERS DO FORMULÁRIO ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPerfil(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tag) => {
        const tagsSelecionadas = [...perfil.usutags];
        if (tagsSelecionadas.includes(tag)) {
            setPerfil(prev => ({ ...prev, usutags: tagsSelecionadas.filter(t => t !== tag) }));
        } else {
            setPerfil(prev => ({ ...prev, usutags: [...tagsSelecionadas, tag] }));
        }
    };

    const handleProficienciaChange = (tag, proficiencia) => {
        setPerfil(prev => ({
            ...prev,
            usuproficiencia: {
                ...prev.usuproficiencia,
                [tag]: proficiencia,
            },
        }));
    };

    // --- HANDLER DE SALVAR ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        // Prepara os dados para enviar
        const dataToSend = {
            usunome: perfil.usunome,
            usuemail: perfil.usuemail,
            usudatanascimento: perfil.usudatanascimento,
            usudisponibilidade: perfil.usudisponibilidade,
            usuportifolio: perfil.usuportifolio,
            usufoto: perfil.usufoto, // Enviando a URL da foto
            usutags: JSON.stringify(perfil.usutags),
            usuproficiencia: JSON.stringify(perfil.usuproficiencia)
        };

        if (novaSenha.trim() !== '') {
            dataToSend.ususenha = novaSenha;
        }

        api.put(`/usuarios/${user.id}`, dataToSend)
            .then(() => {
                setSuccess("Perfil atualizado com sucesso!");
                setNovaSenha(''); 
            })
            .catch(err => {
                console.error(err);
                setError("Erro ao salvar perfil. Tente novamente.");
            })
            .finally(() => setIsSaving(false));
    };

    // --- HANDLER DE DELETAR CONTA ---
    const handleDeleteAccount = () => {
        if (!confirm("TEM CERTEZA?\nEsta ação é permanente e não pode ser desfeita. Todos os seus projetos serão excluídos.")) return;
        if (!confirm("Confirmação final: Deletar esta conta?")) return;

        api.delete(`/usuarios/${user.id}`)
            .then(() => {
                alert("Conta deletada com sucesso.");
                logout(); 
            })
            .catch(err => {
                console.error(err);
                setError("Não foi possível deletar a conta. Verifique se você ainda é dono de algum projeto.");
            });
    };


    if (loading || authLoading || !perfil) {
        return <div className={styles.container}><p>Carregando...</p></div>;
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.profileCard}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>Editar Perfil</h1>
                        <Link href={`/perfil/${user.id}`} className={styles.btnSecondary}>
                            Ver Perfil
                        </Link>
                    </div>
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}

                    <section className={styles.formSection}>
                        <h2>Informações Pessoais</h2>
                        <div className={styles.grid}>
                            <div>
                                <label htmlFor="usunome">Nome de Usuário</label>
                                <input type="text" name="usunome" id="usunome" value={perfil.usunome} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="usuemail">Email</label>
                                <input type="email" name="usuemail" id="usuemail" value={perfil.usuemail} onChange={handleChange} />
                            </div>
                        </div>
                        <div className={styles.grid}>
                            <div>
                                <label htmlFor="usudatanascimento">Data de Nascimento</label>
                                <input type="date" name="usudatanascimento" id="usudatanascimento" value={perfil.usudatanascimento} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="novaSenha">Nova Senha (deixe em branco para não alterar)</label>
                                <input type="password" name="novaSenha" id="novaSenha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h2>Disponibilidade e Portfólio</h2>
                        <div className={styles.grid}>
                            <div>
                                <label htmlFor="usudisponibilidade">Disponibilidade</label>
                                <select name="usudisponibilidade" id="usudisponibilidade" value={perfil.usudisponibilidade} onChange={handleChange}>
                                    <option value="">Não especificado</option>
                                    <option value="integral">Integral (Full-time)</option>
                                    <option value="parcial">Parcial (Part-time)</option>
                                    <option value="freelance">Freelance / Sob Demanda</option>
                                    <option value="indisponivel">Indisponível</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="usuportifolio">Link do Portfólio (URL)</label>
                                <input type="url" name="usuportifolio" id="usuportifolio" value={perfil.usuportifolio} onChange={handleChange} placeholder="https://seu-site.com" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="usufoto">URL da Foto de Perfil</label>
                            <input type="url" name="usufoto" id="usufoto" value={perfil.usufoto} onChange={handleChange} placeholder="https://imgur.com/link-da-foto.png" />
                            <div style={{ 
                                    backgroundColor: 'rgba(0,0,0,0.05)', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.85rem', 
                                    color: '#666',
                                    marginTop: '5px',
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}>
                                    <p style={{ margin: '0 0 8px 0' }}>
                                        <strong>Como colocar uma foto?</strong>
                                    </p>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        <li style={{ marginBottom: '4px' }}>
                                            Já tem a foto online? Clique com o botão direito nela e selecione <em>"Copiar endereço da imagem"</em>.
                                        </li>
                                        <li>
                                            A foto está no seu PC? Faça o upload gratuito no 
                                            <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'underline', marginLeft: '4px' }}>Imgur</a> ou 
                                            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'underline', marginLeft: '4px' }}>ImgBB</a>.
                                            <br />
                                            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Após o upload, copie o "Link Direto" ou "Direct Link" que termina em .png ou .jpg)</span>.
                                        </li>
                                    </ul>
                                </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h2>Habilidades (Tags)</h2>
                        <div className={styles.tagList}>
                            {tagsDisponiveis.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`${styles.tagButton} ${perfil.usutags.includes(tag) ? styles.tagButtonSelected : ''}`}
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </section>
                    
                    {perfil.usutags.length > 0 && (
                        <section className={styles.formSection}>
                            <h2>Nível de Proficiência</h2>
                            <table className={styles.proficienciaTable}>
                                <thead>
                                    <tr>
                                        <th>Habilidade</th>
                                        <th>Nível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perfil.usutags.map(tag => (
                                        <tr key={tag}>
                                            <td>{tag}</td>
                                            <td>
                                                <select
                                                    name={`proficiencia-${tag}`}
                                                    value={perfil.usuproficiencia[tag] || ''}
                                                    onChange={(e) => handleProficienciaChange(tag, e.target.value)}
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="Básico">Básico</option>
                                                    <option value="Intermediário">Intermediário</option>
                                                    <option value="Avançado">Avançado</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    )}

                    <div className={styles.saveButtonWrapper}>
                        <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </div>

                {/* Card 2: Zona de Perigo */}
                <div className={`${styles.profileCard} ${styles.dangerZone}`}>
                    <h2 className={styles.dangerTitle}>Zona de Perigo</h2>
                    <p>Cuidado, estas ações são permanentes.</p>
                    <button type="button" className={styles.btnDanger} onClick={handleDeleteAccount}>
                        Deletar Minha Conta
                    </button>
                </div>
            </form>
        </div>
    );
}