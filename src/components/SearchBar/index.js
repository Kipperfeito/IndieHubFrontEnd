import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import api from "@/services/api"; 
import style from "./searchBar.module.css";

export default function SearchBar({ setResults }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (input.trim().length < 2) {
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
  }, [input, setResults]);

  const fetchData = async (value) => {
    try {
      console.log("Buscando por:", value); 
      const response = await api.get(`/api/search?q=${value}`);

      setResults(response.data);
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setResults([]); 
    }
  };
  const handleChange = (value) => {
    setInput(value);
  };

  return (
    <div className={style.searchBarWrapper}>
      <FaSearch id={style.searchIcon} />
      <input
        className={style.searchInput}
        placeholder="Busque por Devs, Skills (Unity, React) ou Vagas..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}