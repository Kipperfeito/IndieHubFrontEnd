import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

import style from "./searchBar.module.css";

export default function SearchBar({ setResults }) {

  const [input, setInput] = useState("");

  // useEffect para o "Debouncing" (evitar chamadas de API a cada tecla)
  useEffect(() => {

    if (input.trim() === "") {
      setResults([]);
      return;
    }
    // Aguarda 500ms após o usuário parar de digitar
    const timer = setTimeout(() => {
      fetchData(input);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [input, setResults]); // re-executa quando 'input' ou 'setResults' mudar

  // Função que busca os dados na API
  const fetchData = (value) => {
    // Usamos a API de placeholder. Troque pela sua API real.
    // A API é otimizada para buscar apenas nomes que contenham o valor
    fetch(`https://jsonplaceholder.typicode.com/users?name_like=${value}`)
      .then((response) => response.json())
      .then((json) => {
        // 3. Entrega os resultados para o componente pai
        setResults(json);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        setResults([]); // Limpa os resultados em caso de erro
      });
  };

  const handleChange = (value) => {
    setInput(value);
  };

  return (
    <div className={style.searchBarWrapper}>
      <FaSearch id={style.searchIcon} />
      <input
        className={style.searchInput}
        placeholder="Procure por criadores, projetos..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
