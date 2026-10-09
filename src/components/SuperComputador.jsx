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
    quantVBrancos,
    quantVNulos,
    quantAbstencoes,
    candidato1,
    candidato2,
    totalValidosEsperados,
    comSom,
    setVencedor,
  } = useVoting();

  const [candidato1SP, setCandidato1SP] = useState(0);
  const [candidato2SP, setCandidato2SP] = useState(0);
  const [corruption, setCorruption] = useState(false);

  const audioCorruptionRef = useRef(new Audio(corruptionMoney));
  const audioFestaPRef = useRef(new Audio(festaPolicia));
  const audioFestaLRef = useRef(new Audio(festaLadrao));
  const finalAudioTocandoRef = useRef(false);

  const totalValidosSP = candidato1SP + candidato2SP;
  const limiteSP = Number(totalValidosEsperados) || 1;

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

  useEffect(() => {
    if (corruption && comSom) {
      audioCorruptionRef.current.currentTime = 0;
      audioCorruptionRef.current.play().catch(() => {});
    }
  }, [corruption, comSom]);

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

  // Aciona a vitória, bloqueia a urna e toca o áudio festivo
  useEffect(() => {
    if (porcentGeralSP === 100 && !finalAudioTocandoRef.current) {
      finalAudioTocandoRef.current = true;

      const p1 = Number(porcentCand1SP);
      const p2 = Number(porcentCand2SP);

      if (p1 > p2) {
        setVencedor({ nome: "Candidato 1", selo: vitPolicia });
        if (comSom) {
          setTimeout(() => {
            audioFestaPRef.current.play().catch(() => {});
          }, 500);
        }
      } else if (p2 > p1) {
        setVencedor({ nome: "Candidato 2", selo: vitLadrao });
        if (comSom) {
          setTimeout(() => {
            audioFestaLRef.current.play().catch(() => {});
          }, 500);
        }
      }
    }
  }, [porcentGeralSP, porcentCand1SP, porcentCand2SP, comSom, setVencedor]);

  const liderCand1 = Number(porcentCand1SP) > 50;
  const liderCand2 = Number(porcentCand2SP) > 50;

  const corBarra = useMemo(() => {
    if (Number(porcentCand1SP) > 50) return "#10b981";
    if (Number(porcentCand1SP) === 50) return "#64748b";
    return "#f43f5e";
  }, [porcentCand1SP]);

  return (
    <div className={styles.porcentagem}>
      <div className={styles.result}>
        <div className={styles.logodindin}>
          <div
            className={styles.logo}
            onClick={() => setCorruption((prev) => !prev)}
            role="button"
            tabIndex={0}
            title="Clique para alternar o modo auditoria"
          >
            <span className={`${styles.dindin} ${corruption ? styles.dindinCorrompido : ''}`}>
              $UPER
            </span>
            <span>Computer</span>
          </div>

          <span className={`${styles.statusAudit} ${corruption ? styles.statusAuditAlert : ''}`}>
            {corruption ? 'MODO DESVIO' : 'AUDITORIA'}
          </span>
        </div>

        <div className={styles.estatisticas}>
          <div className={styles.resultado}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Brancos</span>
              <span className={styles.statValue}>{quantVBrancos}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Nulos</span>
              <span className={styles.statValue}>{quantVNulos}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Abstenções</span>
              <span className={styles.statValue}>{quantAbstencoes}</span>
            </div>

            <div className={`${styles.statCard} ${styles.cardCand1}`}>
              <span className={styles.statLabel}>Candidato 1</span>
              <span className={styles.statValue}>{candidato1SP}</span>
            </div>

            <div className={`${styles.statCard} ${styles.cardCand2}`}>
              <span className={styles.statLabel}>Candidato 2</span>
              <span className={styles.statValue}>{candidato2SP}</span>
            </div>

            <div className={`${styles.statCard} ${styles.cardValidos}`}>
              <span className={styles.statLabel}>Válidos</span>
              <span className={styles.statValue}>{totalValidosSP}</span>
            </div>
          </div>
        </div>

        <div className={styles.porcentagemtopo}>
          <div className={`${styles.candidatoPill} ${liderCand1 ? styles.candidatoPillLider : ''}`}>
            <div className={styles.avatarWrapper}>
              <img src={imgPolicia1} alt="Candidato 1" className={styles.avatar} />
            </div>
            <div className={styles.candInfo}>
              <span className={styles.candNome}>44 - Candidato 1</span>
              <span className={`${styles.candPorcent} ${liderCand1 ? styles.candPorcentLider : ''}`}>
                {porcentCand1SP}%
              </span>
            </div>
          </div>

          <div className={`${styles.candidatoPill} ${liderCand2 ? styles.candidatoPillLider : ''}`}>
            <div className={styles.avatarWrapper}>
              <img src={imgLadrao1} alt="Candidato 2" className={styles.avatar} />
            </div>
            <div className={styles.candInfo}>
              <span className={styles.candNome}>11 - Candidato 2</span>
              <span className={`${styles.candPorcent} ${liderCand2 ? styles.candPorcentLider : ''}`}>
                {porcentCand2SP}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.barra1}>
        <div
          className={styles.barra2}
          style={{
            width: `${porcentGeralSP}%`,
            backgroundColor: corBarra,
            color: corBarra,
          }}
        >
          <div className={styles.bonequinho}>
            <span>{porcentGeralSP}%</span>
            <img
              src={porcentGeralSP !== 100 ? imgBonequinho : imgBonequinho2}
              alt="Progresso"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperComputador;