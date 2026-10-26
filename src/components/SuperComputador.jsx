import { useEffect, useState, useMemo, useRef } from 'react';
import styles from './supercomputador.module.css';
import { useVoting } from '../context/VotingContext';

import imgPolicia1 from '../assets/img/policia.jpg';
import imgLadrao1 from '../assets/img/bandido.jpg';
import imgBonequinho from '../assets/img/running.gif';
import imgBonequinho2 from '../assets/img/running.png';

import corruptionMoney from '../assets/audio/money.mp3';
import festaPolicia from '../assets/audio/somfestapoliciageral.mp3';
import festaLadrao from '../assets/audio/somfestaladraogeral.mp3';
import vitPolicia from '../assets/img/seloPolicia.png';
import vitLadrao from '../assets/img/seloladrao.png';

function SuperComputador() {
  const {
    quantAbstencoes,
    quantVBrancos,
    quantVNulos,
    candidato1,
    candidato2,
    totalVotosReal,
    comSom,
  } = useVoting();

  const [candidato1SP, setCandidato1SP] = useState(0);
  const [candidato2SP, setCandidato2SP] = useState(0);
  const [corruption, setCorruption] = useState(false);

  // Instâncias estáveis de áudio
  const audioCorruptionRef = useRef(new Audio(corruptionMoney));
  const audioFestaPRef = useRef(new Audio(festaPolicia));
  const audioFestaLRef = useRef(new Audio(festaLadrao));
  const finalAudioTocandoRef = useRef(false);

  // Votos válidos e apuração interna do SuperComputador
  const totalValidosSP = candidato1SP + candidato2SP;
  const limiteSP = Number(totalVotosReal) || 1;

  const porcentGeralSP = useMemo(() => {
    const calc = Math.floor((totalValidosSP / limiteSP) * 100);
    return Math.min(100, Math.max(0, calc || 0));
  }, [totalValidosSP, limiteSP]);

  const porcentCand1SP = useMemo(() => {
    if (totalValidosSP === 0) return "0.00";
    return ((candidato1SP / totalValidosSP) * 100).toFixed(2);
  }, [candidato1SP, totalValidosSP]);

  const porcentCand2SP = useMemo(() => {
    if (totalValidosSP === 0) return "0.00";
    return ((candidato2SP / totalValidosSP) * 100).toFixed(2);
  }, [candidato2SP, totalValidosSP]);

  // Listener seguro para o botão do meio do mouse
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.button === 1) {
        event.preventDefault();
        setCorruption((prev) => !prev);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Efeito sonoro do modo corrupção
  useEffect(() => {
    if (corruption && comSom) {
      audioCorruptionRef.current.currentTime = 0;
      audioCorruptionRef.current.play().catch(() => {});
    }
  }, [corruption, comSom]);

  // Algoritmo de desvio de voto da urna para o SuperComputador
  const ultimoVotoCand1Ref = useRef(candidato1);
  useEffect(() => {
    if (candidato1 > ultimoVotoCand1Ref.current) {
      const diff = candidato1 - ultimoVotoCand1Ref.current;
      ultimoVotoCand1Ref.current = candidato1;

      for (let i = 0; i < diff; i++) {
        setCandidato2SP((prevCand2) => {
          const totalAtual = candidato1SP + prevCand2;
          const porcentagemCand2 = totalAtual > 0 ? (prevCand2 / totalAtual) * 100 : 0;

          if (corruption && porcentagemCand2 < 52.0) {
            return prevCand2 + 1;
          } else {
            setCandidato1SP((p1) => p1 + 1);
            return prevCand2;
          }
        });
      }
    } else {
      ultimoVotoCand1Ref.current = candidato1;
    }
  }, [candidato1, corruption, candidato1SP]);

  const ultimoVotoCand2Ref = useRef(candidato2);
  useEffect(() => {
    if (candidato2 > ultimoVotoCand2Ref.current) {
      const diff = candidato2 - ultimoVotoCand2Ref.current;
      ultimoVotoCand2Ref.current = candidato2;
      setCandidato2SP((prev) => prev + diff);
    } else {
      ultimoVotoCand2Ref.current = candidato2;
    }
  }, [candidato2]);

  // Celebração final de 100%
  useEffect(() => {
    if (porcentGeralSP === 100 && !finalAudioTocandoRef.current && comSom) {
      finalAudioTocandoRef.current = true;
      const timer = setTimeout(() => {
        if (Number(porcentCand1SP) > Number(porcentCand2SP)) {
          audioFestaPRef.current.play().catch(() => {});
        } else if (Number(porcentCand2SP) > Number(porcentCand1SP)) {
          audioFestaLRef.current.play().catch(() => {});
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [porcentGeralSP, porcentCand1SP, porcentCand2SP, comSom]);

  // Imagem de selo final
  const seloFinal = useMemo(() => {
    if (porcentGeralSP !== 100) return null;
    if (Number(porcentCand1SP) > 50) return vitPolicia;
    if (Number(porcentCand2SP) > 50) return vitLadrao;
    return null;
  }, [porcentGeralSP, porcentCand1SP, porcentCand2SP]);

  const cand1Lider = Number(porcentCand1SP) > 50;
  const cand2Lider = Number(porcentCand2SP) > 50;

  // Cor dinâmica da barra com gradiente sutil
  const corBarraProgresso = useMemo(() => {
    if (Number(porcentCand1SP) > 50) return "linear-gradient(90deg, #1f6feb, #2ea043)";
    if (Number(porcentCand2SP) > 50) return "linear-gradient(90deg, #1f6feb, #da3633)";
    return "linear-gradient(90deg, #30363d, #6e7681)";
  }, [porcentCand1SP, porcentCand2SP]);

  return (
    <div className={styles.porcentagem}>
      <div className={styles.result}>
        {/* Lado Esquerdo: Identificação e Gatilho Secreto */}
        <div className={styles.logodindin}>
          <div
            className={styles.logo}
            onClick={() => setCorruption((prev) => !prev)}
            role="button"
            tabIndex={0}
            title="Alternar modo"
          >
            <span
              className={styles.dindin}
              style={{ color: corruption ? "#f85149" : "#3fb950" }}
            >
              $UPER
            </span>
            <span>COMPUTER</span>
          </div>
        </div>

        {/* Centro: Contadores Organizados em Grid */}
        <div className={styles.estatisticas}>
          <div className={styles.resultado}>
            <div className={styles.vabstencoes}>
              <p>
                Abstenção
                <strong className={styles.vabstencoes2}>{quantAbstencoes}</strong>
              </p>
            </div>
            <div className={styles.vbrancos}>
              <p>
                Brancos
                <strong className={styles.vbrancos2}>{quantVBrancos}</strong>
              </p>
            </div>
            <div className={styles.vnulos}>
              <p>
                Nulos
                <strong className={styles.vnulos2}>{quantVNulos}</strong>
              </p>
            </div>
            <div className={styles.candidatoum}>
              <p>
                Polícia
                <strong className={styles.candidatoumum}>{candidato1SP}</strong>
              </p>
            </div>
            <div className={styles.candidatodois}>
              <p>
                Ladrão
                <strong className={styles.candidatodoisdois}>{candidato2SP}</strong>
              </p>
            </div>
            <div className={styles.totalvotosvalidos}>
              <p>
                Válidos
                <strong className={styles.totalvotos}>{totalValidosSP}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Cards dos Candidatos em Destaque */}
        <div className={styles.porcentagemtopo}>
          {/* Card Candidato 1 */}
          <div
            className={`${styles.candCard} ${cand1Lider ? styles.candLider : ''}`}
            title="Polícia (Nº 44)"
          >
            <img src={imgPolicia1} alt="Polícia" className={styles.imgpol} />
            <div className={styles.candInfo}>
              <div className={styles.candHeader}>
                <span className={styles.candNome}>44 POLÍCIA</span>
                {cand1Lider && <span className={styles.badgeLider}>LÍDER</span>}
              </div>
              <span className={styles.candValor}>{porcentCand1SP}%</span>
            </div>
          </div>

          {/* Card Candidato 2 */}
          <div
            className={`${styles.candCard} ${cand2Lider ? styles.candLider : ''}`}
            title="Ladrão (Nº 11)"
          >
            <img src={imgLadrao1} alt="Ladrão" className={styles.imglad} />
            <div className={styles.candInfo}>
              <div className={styles.candHeader}>
                <span className={styles.candNome}>11 LADRÃO</span>
                {cand2Lider && <span className={styles.badgeLider}>LÍDER</span>}
              </div>
              <span className={styles.candValor}>{porcentCand2SP}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Geral da Totalização */}
      <div className={styles.barra1}>
        <div
          className={styles.barra2}
          style={{
            width: `${porcentGeralSP}%`,
            background: corBarraProgresso,
            transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1), background 600ms ease",
          }}
        >
          <div className={styles.bonequinho}>
            <span>{porcentGeralSP}% APURADO</span>
            <img
              src={porcentGeralSP !== 100 ? imgBonequinho : imgBonequinho2}
              alt="Status apuração"
            />
          </div>
        </div>
      </div>

      {/* Selo final comemorativo */}
      {seloFinal && (
        <div className={styles.imagemfinal}>
          <img src={seloFinal} alt="Selo de Vitória" />
        </div>
      )}
    </div>
  );
}

export default SuperComputador;