import { useState } from "react";
import SearchBar from "@/components/SearchBar"; 
import CardProjeto from "@/components/CardProjeto"

// Componente de lista de resultados (vou criar uma components de RESULTADOS)
const SearchResultsList = ({ results }) => {
  if (results.length === 0) {
    return <p>Nenhum resultado encontrado.</p>;
  }

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '500px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      marginTop: '10px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
    }}>
      {results.map((user) => (
        <div 
          key={user.id} 
          style={{ 
            padding: '15px 20px', 
            borderBottom: '1px solid #eee' 
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

export default function TelaInicial() {
  const [results, setResults] = useState([]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '40px' 
      }}>
        {/* 3. Passamos 'setResults' para a SearchBar. 
          A SearchBar usará essa função para nos enviar os dados.
        */}
        <SearchBar setResults={setResults} />
        
        {/* 4. Exibimos os resultados que estão no nosso estado 'results' */}
        <SearchResultsList results={results} />
        
        <CardProjeto />
      </div>
    </>
  );
}
