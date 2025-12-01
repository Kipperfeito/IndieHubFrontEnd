import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css";
import Link from "next/link";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from "@/services/api"

export default function CadastroUsuario() {
    const router = useRouter();

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
    
    const [erro, setErro] = useState(''); // Estado único para todas as mensagens de erro.

    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erroSenha, setErroSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);

    //VALIDAÇÕES
    const validaEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    const validaNome = (nome) => {
        const regexEmoji = /[\u{1F300}-\u{1F6FF}]/u;
        return regexEmoji.test(nome)
    }
    const validaSenhaForte = (senha) => {
        // Critério 1: Mínimo de 8 caracteres
        if (senha.length < 8) {
            setErroSenha(true);
            setErro("Pelo menos 8 caracteres");
            return false;
        }
        // Critério 2: Pelo menos uma letra minúscula
        if (!/[a-z]/.test(senha)) {
            setErroSenha(true)
            setErro("Pelo menos uma letra minúscula (a-z)");
            return false;
        }
        // Critério 3: Pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(senha)) {
            setErroSenha(true)
            setErro("Pelo menos uma letra maiúscula (A-Z)");
            return false;
        }
        // Critério 4: Pelo menos um número
        if (!/\d/.test(senha)) {
            setErroSenha(true)
            setErro("Pelo menos um número (0-9)");
            return false;
        }
        // Critério 5: Pelo menos um caractere especial
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
            setErroSenha(true)
            setErro("Pelo menos um caractere especial (!@#$...)");
            return false;
        }
        return true;
    }

    const proximaEtapa = () => {
        // Limpa erros antigos antes de validar novamente
        setErro('');
        setErroSenha(false);
        const dataAtual = new Date()
        dataAtual.setUTCHours(0, 0, 0, 0);
        const dataNascimento = new Date(usuario.usudatanascimento);
        dataNascimento.setUTCHours(0, 0, 0, 0);
        // Validação baseada na etapa ATUAL
        if (etapa === 1) {
            if (!usuario.usunome || !usuario.usuemail || !usuario.usudatanascimento) {
                setErro("Por favor, preencha todos os campos obrigatórios.");
                return; // Para a execução
            }
            else if(validaNome(usuario.usunome)) {
                setErro("Qual é o seu nome? Ex: Lucas Alves");
                return; // Para a execução se o e-mail for inválido
            }
            else if(!validaEmail(usuario.usuemail)) {
                setErro("O formato do e-mail é inválido. Ex: nome@dominio.com");
                return; // Para a execução se o e-mail for inválido
            }
            //Verificação de idade
            else {
                if (dataNascimento > dataAtual) {
                    setErro("Você não pode ter nascido no futuro! Por favor, insira uma data válida.")
                    return;
                }
                var anos = dataAtual.getFullYear() - dataNascimento.getFullYear();
                var meses = dataAtual.getMonth() - dataNascimento.getMonth();
                var dias = dataAtual.getDate() - dataNascimento.getDate();

                if (dias < 0) {
                    meses--; // Reduz um mês
                    // Adiciona o número de dias do mês anterior ao dia de hoje
                    // O truque `new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate()` retorna o último dia do mês anterior.
                    dias += new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 0).getDate();
                }
                // Se o número de meses for negativo, "pegamos emprestado" do ano anterior
                if (meses < 0) {
                    anos--; // Reduz um ano
                    meses += 12;
                }

                let mensagem = `Você tem ${anos} anos, ${meses} meses e ${dias} dias.`;

                  // Verifica se é o aniversário do usuário
                /*if (dataAtual.getMonth() === dataNascimento.getMonth() && dataAtual.getDate() === dataNascimento.getDate()) {
                    mensagem = `🎉 Feliz aniversário! Hoje você completa <strong>${anos} anos</strong>! 🎉`;
                }*/
            
                const idadeMinima = 16;
                const idadeMaxima = 116;
                if (anos > idadeMaxima) {
                    setErro("Por favor, coloque uma data válida.")
                    return;
                }
                else if (anos >= idadeMinima){
                    console.log("Acesso permitido! " + anos + " anos.");
                    setEtapa(etapa + 1);
                }
                else {
                    setErro("Acesso negado! Você precisa ter no mínimo " + idadeMinima + " anos.")
                    console.log("Acesso negado! " + anos + " anos.");
                    return;
                }
            }
        } 
        else if (etapa === 2) {
            if (!usuario.ususenha) {
                setErro("Por favor, preencha todos os campos obrigatórios.");
                setErroSenha(true);
                return; // Para a execução
            }
            else if (usuario.ususenha !== confirmaSenha) {
                setErro('As senhas não coincidem!');
                return; // Para a execução
            }
            else if (!validaSenhaForte(usuario.ususenha)) {
                return;
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

        const dadosParaEnviar = {
            ...usuario,
            
            // O objeto {"C#": "Básico"} vira a string '{"C#": "Básico"}'
            usuproficiencia: JSON.stringify(usuario.usuproficiencia),
            
            // O array ["C#", "React"] vira a string '["C#", "React"]'
            usutags: JSON.stringify(usuario.usutags)
        };

        console.log("Enviando para a API (formatado):", dadosParaEnviar);

        api
            .post("/usuarios/", dadosParaEnviar)
            .then((res) => {
                console.log(res.data);
                alert("Usuário salvo com sucesso!");
                router.push("/inicial");
            })
            .catch((err) => {
                console.error(err);
                const mensagemErro = err?.response?.data?.message ?? err.message;
                setErro(`Ocorreu um erro ao salvar: ${mensagemErro}`);
            });
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

    return (
        <>
            <div className={styles.container}>
                <h3>Formulário de Cadastro de Usuários</h3>
                {/* Exibe a mensagem de erro aqui, de forma centralizada */}
                {erro && <p className={styles.erro}>{erro}</p>}

                <form onSubmit={handleSubmit} className={styles.formCadastro}>
                    {etapa === 1 && (
                        <>
                            <label htmlFor="usunome">Nome: </label>
                            <input type="text" id="usunome" name="usunome" maxLength="20" value={usuario.usunome} onChange={handleChange} />
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
                            <div className={styles.passwordGroup}>
                                <label htmlFor="ususenha">Senha: </label>
                                <div className={styles.inputWithIcon}>
                                    <input type={mostrarSenha ? "text" : "password"} id="ususenha" name="ususenha" value={usuario.ususenha} onChange={handleChange} /> 
                                        <button 
                                            type="button" 
                                            onClick={() => setMostrarSenha(!mostrarSenha)} 
                                            className={styles.iconButton}
                                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {mostrarSenha ? <FiEye /> : <FiEyeOff />}
                                        </button>
                                </div>
                                {/*Lista de requisitos para a senha */}
                                {erroSenha &&
                                <div className={styles.requisitosSenha}>
                                    <strong>A senha deve conter:</strong>
                                    <ul>
                                        <li>Pelo menos 8 caracteres</li>
                                        <li>Pelo menos uma letra minúscula (a-z)</li>
                                        <li>Pelo menos uma letra maiúscula (A-Z)</li>
                                        <li>Pelo menos um número (0-9)</li>
                                        <li>Pelo menos um caractere especial (!@#$...)</li>
                                    </ul>
                                </div>}
                                <br />
                                <label htmlFor="confirmaSenha">Confirme a senha:</label>
                                <div className={styles.inputWithIcon}>
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        id="confirmaSenha"
                                        name="confirmaSenha"
                                        value={confirmaSenha}
                                        onChange={(e) => setConfirmaSenha(e.target.value)}
                                    />
                                    {/* O botão de ícone de confirmação compartilha o mesmo estado e ação */}
                                    <button 
                                        type="button" 
                                        onClick={() => setMostrarSenha(!mostrarSenha)} 
                                        className={styles.iconButton}
                                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {mostrarSenha ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                </div>
                            </div>
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
                                <button type="submit" onClick={handleSubmit}>Salvar Perfil</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
            <Link href={"/inicial"} style={{marginLeft: 10, marginRight: -10}} className="btn btn-secondary"> 
                    Sair
            </Link>
        </>
    );
}
CadastroUsuario.noHeader = true;