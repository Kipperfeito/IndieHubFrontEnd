import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css";

// Supondo que você tenha uma instância 'api' configurada para requisições
// import api from '../services/api'; 

export default function CadastroUsuario() {
    const router = useRouter();

    // --- ESTADOS ---
    // 1. Todos os hooks useState devem vir no início do componente.
    const [etapa, setEtapa] = useState(1);
    const [usuario, setUsuario] = useState({
        usunome: '',
        usuemail: '',
        usudatanascimento: '',
        ususenha: '',
        usutipo: '',
        usutags: [],
        usuproficiencia: {},
        usudisponibilidade: '',
        usuportifolio: '',
        usufoto: '',
    });
    
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erro, setErro] = useState(''); // Estado único para todas as mensagens de erro.

    // --- FUNÇÕES ---

    const proximaEtapa = () => {
        // Limpa erros antigos antes de validar novamente
        setErro('');

        // Validação baseada na etapa ATUAL
        if (etapa === 1) {
            if (!usuario.usunome || !usuario.usuemail) {
                setErro("Por favor, preencha todos os campos obrigatórios.");
                return; // Para a execução
            }
            setEtapa(etapa + 1);
        } 
        else if (etapa === 2) {
            if (!usuario.ususenha) {
                setErro("Por favor, preencha todos os campos obrigatórios.");
                return; // Para a execução
            }
            else if (usuario.ususenha !== confirmaSenha) {
                setErro('As senhas não coincidem!');
                return; // Para a execução
            }
            setEtapa(etapa + 1);
        }
        else setEtapa(etapa + 1);
    }; 

    const etapaAnterior = () => {
        setErro(''); // Limpa erros ao voltar
        setEtapa(etapa - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');

        console.log("Enviando para a API:", usuario);

        // O objeto 'usuario' do estado já tem todos os dados!
        /*
        api
            .post("/usuarios/", usuario) // Envia o objeto do estado diretamente
            .then((res) => {
                console.log(res.data);
                alert("Usuário salvo com sucesso!");
                // router.push("/alguma-pagina");
            })
            .catch((err) => {
                console.error(err);
                const mensagemErro = err?.response?.data?.message ?? err.message;
                setErro(`Ocorreu um erro ao salvar: ${mensagemErro}`);
            });
        */
    };
    const tagsDisponiveis = [
        'C#',
        'Unity',
        'Music Producer',
        'JavaScript',
        'React',
        'SQL',
        'Node.js',
        'UX Design',
        'UI Design'
    ];

    // Função para lidar com a mudança de qualquer input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleTagToggle = (tag) => {
    // Cria uma cópia do array de tags para evitar mutações diretas
        const tagsSelecionadas = [...usuario.usutags];

        if (tagsSelecionadas.includes(tag)) {
            // Se a tag já está selecionada, remove-a
            const novasTags = tagsSelecionadas.filter(t => t !== tag);
            setUsuario({ ...usuario, usutags: novasTags });
        } else {
            // Se a tag não está selecionada, adiciona-a
            setUsuario({ ...usuario, usutags: [...tagsSelecionadas, tag] });
        }
    };
    const handleProficienciaChange = (tag, proficiencia) => {
        setUsuario({
            ...usuario,
            usuproficiencia: {
                ...usuario.usuproficiencia,
                [tag]: proficiencia,
            },
        });
    };

    const fim = () => {alert("Salvado!")}

    return (
        <div className={styles.container}>
            <h3>Formulário de Cadastro de Usuários</h3>
            {/* Exibe a mensagem de erro aqui, de forma centralizada */}
            {erro && <p className={styles.erro}>{erro}</p>}

            <form onSubmit={handleSubmit} className={styles.formCadastro}>
                {etapa === 1 && (
                    <>
                        <label htmlFor="usunome">Nome: </label>
                        <input type="text" id="usunome" name="usunome" value={usuario.usunome} onChange={handleChange} />
                        <br />
                        <label htmlFor="usuemail">Email: </label>
                        <input type="email" id="usuemail" name="usuemail" value={usuario.usuemail} onChange={handleChange} />
                        <br />
                        <label htmlFor="usudatanascimento">Data de Nascimento: </label>
                        <input type="date" id="usudatanascimento" name="usudatanascimento" value={usuario.usudatanascimento} onChange={handleChange} />
                        <br />
                        <button type="button" onClick={proximaEtapa}>Avançar</button>
                    </>
                )}
                {etapa === 2 && (
                    <>
                        <label htmlFor="ususenha">Senha: </label>
                        <input type="password" id="ususenha" name="ususenha" value={usuario.ususenha} onChange={handleChange} />
                        <br />
                        <label htmlFor="confirmaSenha">Confirme a senha:</label>
                        <input
                            type="password"
                            id="confirmaSenha" // ID corrigido para ser único
                            name="confirmaSenha"
                            value={confirmaSenha}
                            onChange={(e) => setConfirmaSenha(e.target.value)}
                        />
                        <br />
                        <div className={styles.buttonGroup}>
                        <button type="button" onClick={etapaAnterior}>Voltar</button>
                        <button type="button" onClick={proximaEtapa}>Avançar</button>
                        </div>
                    </>
                )}
                {etapa === 3 && (
                    <>
                        <h4>Escolha suas habilidades:</h4>
                        <div className={styles.tagList}>
                            {tagsDisponiveis.map(tag => {
                                console.log(`Tag: ${tag}, Selecionada: ${usuario.usutags.includes(tag)}`);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`${styles.tagButton} ${usuario.usutags.includes(tag) ? styles.tagButtonSelected : ''}`}
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        {/* ... outros campos da etapa 3 seguem o mesmo padrão ... */}
                     {/*   <label htmlFor="usuportifolio">Portfólio: </label>
                        <input type="text" id="usuportifolio" name="usuportifolio" value={usuario.usuportifolio} onChange={handleChange} />
                        <br /> */}
                        <div className={styles.buttonGroup}>
                        <button type="button" onClick={etapaAnterior}>Voltar</button>
                        <button type="button" onClick={proximaEtapa}>Avançar</button>
                        </div>
                    </>
                )}
                {etapa === 4 && (
                    <>
                        <h4>Defina seu nível de proficiência:</h4>
                        {usuario.usutags.length > 0 ? (
                            <table className={styles.proficienciaTable}>
                                <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>Nível de Proficiência</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {usuario.usutags.map(tag => (
                                        <tr key={tag}>
                                            <td>{tag}</td>
                                            <td>
                                                <select
                                                    name={`proficiencia-${tag}`}
                                                    value={usuario.usuproficiencia[tag] || ''}
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
                        ) : (
                            <p>Você não selecionou nenhuma tag. Pode avançar para finalizar seu cadastro!</p>
                            )}
                        <div className={styles.buttonGroup}>
                            <button type="button" onClick={etapaAnterior}>Voltar</button>
                            <button type="submit" onClick={fim}>Salvar Perfil</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}