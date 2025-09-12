import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Form.module.css";

export default function CadastroUsuario() {
    const router = useRouter();
    const [usuario, setUsuario] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const {
            usunome,
            usuemail,
            usudatanascimento,
            ususenha,
            usutipo,
            usutags,
            usuproficiencia,
            usudisponibilidade,
            usuportifolio,
            usufoto,
        } = e.target;

        const usuarioSalvar = {
            usunome: usunome.value,
            usuemail: usuemail.value,
            usudatanascimento: usudatanascimento.value,
            ususenha: ususenha.value,
            usutipo: usutipo.value,
            usutags: usutags.value,
            usuproficiencia: usuproficiencia.value,
            usudisponibilidade: usudisponibilidade.value,
            usuportifolio: usuportifolio.value,
            usufoto: usufoto.value,
        };

        // Aqui, substitua 'api' pelo seu método de requisição, como axios ou fetch
        api
            .post("/usuarios/", usuarioSalvar)
            .then((res) => {
                console.log(res.data);
                alert("Usuário salvo com sucesso!");
                // router.push("/listagem-personagens");
            })
            .catch((err) => {
                console.error(err);
                alert("Ocorreu um erro ao salvar o usuário!");
                alert(err?.response?.data?.message ?? err.message);
            });
    };

    return (
        <div className={styles.container}>
            <h3>Formulário de Cadastro de Usuários</h3>
            <form onSubmit={handleSubmit} className={styles.formCadastro}>
                <label htmlFor="nome">Nome: </label>
                <input
                    type="text"
                    id="usunome"
                    name="usunome"
                    value={usuario.usunome}
                    onChange={(e) => setUsuario({ ...usuario, usunome: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="email">Email: </label>
                <input
                    type="email"
                    id="usuemail"
                    name="usuemail"
                    value={usuario.usuemail}
                    onChange={(e) => setUsuario({ ...usuario, usuemail: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="usudatanascimento">Data de Nascimento: </label>
                <input
                    type="date"
                    id="usudatanascimento"
                    name="usudatanascimento"
                    value={usuario.usudatanascimento}
                    onChange={(e) => setUsuario({ ...usuario, usudatanascimento: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="senha">Senha: </label>
                <input
                    type="password"
                    id="ususenha"
                    name="ususenha"
                    value={usuario.ususenha}
                    onChange={(e) => setUsuario({ ...usuario, ususenha: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="tipo">Tipo de Usuário: </label>
                <input
                    type="text"
                    id="usutipo"
                    name="usutipo"
                    value={usuario.usutipo}
                    onChange={(e) => setUsuario({ ...usuario, usutipo: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="tags">Tags: </label>
                <input
                    type="text"
                    id="usutags"
                    name="usutags"
                    value={usuario.usutags}
                    onChange={(e) => setUsuario({ ...usuario, usutags: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="proficiencia">Proficiência: </label>
                <input
                    type="text"
                    id="usuproficiencia"
                    name="usuproficiencia"
                    value={usuario.usuproficiencia}
                    onChange={(e) => setUsuario({ ...usuario, usuproficiencia: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="disponibilidade">Disponibilidade: </label>
                <input
                    type="text"
                    id="usudisponibilidade"
                    name="usudisponibilidade"
                    value={usuario.usudisponibilidade}
                    onChange={(e) => setUsuario({ ...usuario, usudisponibilidade: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="portifolio">Portfólio: </label>
                <input
                    type="text"
                    id="usuportifolio"
                    name="usuportifolio"
                    value={usuario.usuportifolio}
                    onChange={(e) => setUsuario({ ...usuario, usuportifolio: e.target.value })}
                />{" "}
                <br />
                <label htmlFor="foto">Foto (URL): </label>
                <input
                    type="text"
                    id="usufoto"
                    name="usufoto"
                    value={usuario.usufoto}
                    onChange={(e) => setUsuario({ ...usuario, usufoto: e.target.value })}
                />{" "}
                <br />
                <button type="submit">Salvar</button>
            </form>
        </div>
    );
}
