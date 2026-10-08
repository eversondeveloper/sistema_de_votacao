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
  const [totalVotosReal, setTotalVotosReal] = useState(100);
  const [porcentCand1Real, setPorcentCand1Real] = useState(51);
  const [comSom, setComSom] = useState(true);

  // Estados derivados calculados automaticamente sem dessincronização
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
    totalValidos,
    totalVotosReal,
    setTotalVotosReal,
    porcentCand1Real,
    setPorcentCand1Real,
    porcentCand2Real,
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