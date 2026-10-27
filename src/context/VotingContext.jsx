/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo } from "react";

const VotingContext = createContext();

export function VotingProvider({ children }) {
  const [num1Digit, setNum1Digit] = useState("");
  const [num2Digit, setNum2Digit] = useState("");
  const [btnBranco, setBtnBranco] = useState(false);
  const [quantVBrancos, setQuantVBrancos] = useState(0);
  const [quantVNulos, setQuantVNulos] = useState(0);
  const [candidato1, setCandidato1] = useState(0);
  const [candidato2, setCandidato2] = useState(0);
  const [quantAbstencoes, setQuantAbstencoes] = useState(0);

  // Parâmetros configuráveis da eleição
  const [eleitoresTotais, setEleitoresTotais] = useState(158);
  const [porcentCand1Real, setPorcentCand1Real] = useState(51);
  const [porcentAbstencaoMeta, setPorcentAbstencaoMeta] = useState(20.5);
  const [porcentBrancosMeta, setPorcentBrancosMeta] = useState(1.4);
  const [porcentNulosMeta, setPorcentNulosMeta] = useState(3.1);
  const [comSom, setComSom] = useState(true);

  // Votos válidos calculados automaticamente com base nos eleitores e nas porcentagens
  const totalVotosReal = useMemo(() => {
    const totalEleitores = Number(eleitoresTotais) || 0;
    const qtdAbs = Math.round((totalEleitores * Number(porcentAbstencaoMeta || 0)) / 100);
    const qtdBra = Math.round((totalEleitores * Number(porcentBrancosMeta || 0)) / 100);
    const qtdNul = Math.round((totalEleitores * Number(porcentNulosMeta || 0)) / 100);

    const validosCalculados = totalEleitores - (qtdAbs + qtdBra + qtdNul);
    return Math.max(0, validosCalculados);
  }, [eleitoresTotais, porcentAbstencaoMeta, porcentBrancosMeta, porcentNulosMeta]);

  // Meta calculada do candidato 2
  const porcentCand2Real = useMemo(() => {
    const val = 100 - Number(porcentCand1Real || 0);
    return Math.max(0, Math.min(100, val));
  }, [porcentCand1Real]);

  const totalValidos = candidato1 + candidato2;

  const porcentCand1 = useMemo(() => {
    if (totalValidos === 0) return "0.00";
    return ((candidato1 / totalValidos) * 100).toFixed(2);
  }, [candidato1, totalValidos]);

  const porcentCand2 = useMemo(() => {
    if (totalValidos === 0) return "0.00";
    return ((candidato2 / totalValidos) * 100).toFixed(2);
  }, [candidato2, totalValidos]);

  const value = {
    num1Digit,
    setNum1Digit,
    num2Digit,
    setNum2Digit,
    btnBranco,
    setBtnBranco,
    quantVBrancos,
    setQuantVBrancos,
    quantVNulos,
    setQuantVNulos,
    candidato1,
    setCandidato1,
    candidato2,
    setCandidato2,
    quantAbstencoes,
    setQuantAbstencoes,
    totalValidos,
    eleitoresTotais,
    setEleitoresTotais,
    totalVotosReal,
    porcentCand1Real,
    setPorcentCand1Real,
    porcentCand2Real,
    porcentBrancosMeta,
    setPorcentBrancosMeta,
    porcentNulosMeta,
    setPorcentNulosMeta,
    porcentAbstencaoMeta,
    setPorcentAbstencaoMeta,
    porcentCand1,
    porcentCand2,
    comSom,
    setComSom,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting deve ser usado dentro de um VotingProvider");
  }
  return context;
}