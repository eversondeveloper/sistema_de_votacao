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
  const [quantAbstencoes, setQuantAbstencoes] = useState(0);
  const [candidato1, setCandidato1] = useState(0);
  const [candidato2, setCandidato2] = useState(0);

  // Metas do simulador automático
  const [totalVotosReal, setTotalVotosReal] = useState(100);
  const [porcentCand1Real, setPorcentCand1Real] = useState(51);
  const [quantBrancosReal, setQuantBrancosReal] = useState(5);
  const [quantNulosReal, setQuantNulosReal] = useState(5);
  const [quantAbstencoesReal, setQuantAbstencoesReal] = useState(10);
  const [comSom, setComSom] = useState(true);

  // Estado global do vencedor para bloquear a urna e centralizar o selo
  const [vencedor, setVencedor] = useState(null);

  const porcentCand2Real = useMemo(() => {
    const val = 100 - Number(porcentCand1Real || 0);
    return Math.max(0, Math.min(100, val));
  }, [porcentCand1Real]);

  const totalValidosEsperados = useMemo(() => {
    const total = Number(totalVotosReal) || 0;
    const brancos = Number(quantBrancosReal) || 0;
    const nulos = Number(quantNulosReal) || 0;
    const abst = Number(quantAbstencoesReal) || 0;
    return Math.max(0, total - (brancos + nulos + abst));
  }, [totalVotosReal, quantBrancosReal, quantNulosReal, quantAbstencoesReal]);

  const totalValidos = candidato1 + candidato2;
  const totalGeral = totalValidos + quantVBrancos + quantVNulos + quantAbstencoes;

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
    quantAbstencoes,
    setQuantAbstencoes,
    candidato1,
    setCandidato1,
    candidato2,
    setCandidato2,
    totalValidos,
    totalGeral,
    totalVotosReal,
    setTotalVotosReal,
    totalValidosEsperados,
    porcentCand1Real,
    setPorcentCand1Real,
    porcentCand2Real,
    quantBrancosReal,
    setQuantBrancosReal,
    quantNulosReal,
    setQuantNulosReal,
    quantAbstencoesReal,
    setQuantAbstencoesReal,
    porcentCand1,
    porcentCand2,
    comSom,
    setComSom,
    vencedor,
    setVencedor,
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