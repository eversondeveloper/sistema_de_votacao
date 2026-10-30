import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import styles from './supercomputador.module.css';
import { useVoting } from '../context/VotingContext';

import imgPolicia1 from '../assets/img/policia.jpg';
import imgLadrao1 from '../assets/img/bandido.jpg';
import imgBonequinho from '../assets/img/running.gif';
import imgBonequinho2 from '../assets/img/running.png';

import corruptionMoney from '../assets/audio/money.mp3';
import festaPolicia from '../assets/audio/somfestapoliciageral.mp3';
import festaLadrao from '../assets/audio/somfestaladraogeral.mp3';
import vitPolicia from '../assets/img/selopolicia.png';
import vitLadrao from '../assets/img/seloladrao.png';

function SuperComputador() {
  const {
    eleitoresTotais,
    quantAbstencoes,
    quantVBrancos,
    quantVNulos,
    candidato1,
    candidato2,
    totalVotosReal,
    porcentCand1Real,
    corruption,
    setCorruption,
    comSom,
  } = useVoting();

  const [candidato1SP, setCandidato1SP] = useState(0);
  const [candidato2SP, setCandidato2SP] = useState(0);

  const audioCorruptionRef = useRef(new Audio(corruptionMoney));
  const audioFestaPRef = useRef(new Audio(festaPolicia));
  const audioFestaLRef = useRef(new Audio(festaLadrao));
  const finalAudioTocandoRef = useRef(false);

  const toggleCorruption = useCallback(() => {
    setCorruption((prev) => !prev);
    if (comSom) {
      audioCorruptionRef.current.currentTime = 0;
      audioCorruptionRef.current.play().catch(() => {});
    }
  }, [setCorruption, comSom]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 1) {
        e.preventDefault();
        toggleCorruption();
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [toggleCorruption]);

  const ultimoUrnaP1 = useRef(candidato1);
  const ultimoUrnaP2 = useRef(candidato2);

  useEffect(() => {
    // 1. Calcula quantos novos votos acabaram de entrar na urna
    const novosVotosCandidato1 = candidato1 - ultimoUrnaP1.current;
    const novosVotosCandidato2 = candidato2 - ultimoUrnaP2.current;

    ultimoUrnaP1.current = candidato1;
    ultimoUrnaP2.current = candidato2;

    const totalNovosVotos =
      (novosVotosCandidato1 > 0 ? novosVotosCandidato1 : 0) +
      (novosVotosCandidato2 > 0 ? novosVotosCandidato2 : 0);

    if (totalNovosVotos === 0) return;

    let votosParaCandidato1 = 0;
    let votosParaCandidato2 = 0;

    // Placar temporário na memória para testar cada voto que entra
    let placarTesteCandidato1 = candidato1SP;
    let placarTesteCandidato2 = candidato2SP;

    // 2. RECUPERAÇÃO GRADUAL: Se a fraude estiver desligada
    if (!corruption) {
      const metaPoliciaPlayer = Number(porcentCand1Real) || 50;

      for (let contador = 0; contador < totalNovosVotos; contador++) {
        const totalValidosTeste = placarTesteCandidato1 + placarTesteCandidato2 + 1;
        const porcentagemPoliciaAtual =
          (placarTesteCandidato1 / (totalValidosTeste - 1 || 1)) * 100;

        // Se o Polícia estiver abaixo da meta do player, canaliza os votos para ele
        if (porcentagemPoliciaAtual < metaPoliciaPlayer) {
          votosParaCandidato1 += 1;
          placarTesteCandidato1 += 1;
        } else {
          // Atingiu a meta: entrega conforme a distribuição de votos que entrou
          if (novosVotosCandidato2 > 0 && votosParaCandidato2 < novosVotosCandidato2) {
            votosParaCandidato2 += 1;
            placarTesteCandidato2 += 1;
          } else {
            votosParaCandidato1 += 1;
            placarTesteCandidato1 += 1;
          }
        }
      }
    } else {
      // 3. FRAUDE LIGADA: Duas fases da apuração
      const eleitoresQueCompareceram =
        candidato1SP + candidato2SP + quantVBrancos + quantVNulos;
      const metadeDosEleitoresTotais = (Number(eleitoresTotais) || 0) * 0.5;
      const passouDeCinquentaPorcento =
        eleitoresQueCompareceram > metadeDosEleitoresTotais;

      // Votos legítimos do Ladrão sempre vão para ele
      if (novosVotosCandidato2 > 0) {
        votosParaCandidato2 += novosVotosCandidato2;
        placarTesteCandidato2 += novosVotosCandidato2;
      }

      // Avalia voto a voto que entrou para o Polícia
      for (let contador = 0; contador < novosVotosCandidato1; contador++) {
        const totalValidosTeste = placarTesteCandidato1 + placarTesteCandidato2 + 1;

        if (!passouDeCinquentaPorcento) {
          // FASE 1: Até 50% dos eleitores -> Polícia lidera limitado a 52,00%
          const porcentagemPoliciaTeste =
            ((placarTesteCandidato1 + 1) / totalValidosTeste) * 100;

          if (porcentagemPoliciaTeste <= 52.00) {
            votosParaCandidato1 += 1;
            placarTesteCandidato1 += 1;
          } else {
            // Ultrapassou 52%: desvia o excedente para o Ladrão
            votosParaCandidato2 += 1;
            placarTesteCandidato2 += 1;
          }
        } else {
          // FASE 2: Após 50% dos eleitores -> Ladrão busca cravar 51,90%
          const porcentagemLadraoTeste =
            (placarTesteCandidato2 / (totalValidosTeste - 1 || 1)) * 100;

          if (porcentagemLadraoTeste < 51.90) {
            votosParaCandidato2 += 1;
            placarTesteCandidato2 += 1;
          } else {
            votosParaCandidato1 += 1;
            placarTesteCandidato1 += 1;
          }
        }
      }
    }

    // 4. Aplica os votos somados no SuperComputador
    if (votosParaCandidato1 > 0) {
      setCandidato1SP((valorAnterior) => valorAnterior + votosParaCandidato1);
    }
    if (votosParaCandidato2 > 0) {
      setCandidato2SP((valorAnterior) => valorAnterior + votosParaCandidato2);
    }
  }, [
    candidato1,
    candidato2,
    corruption,
    candidato1SP,
    candidato2SP,
    eleitoresTotais,
    quantVBrancos,
    quantVNulos,
    porcentCand1Real,
  ]);

  // Cálculos e Porcentagens
  const totalValidosSP = candidato1SP + candidato2SP;
  const limiteSP = Number(totalVotosReal) || 1;

  const porcentGeralSP = useMemo(() => {
    const calc = Math.floor((totalValidosSP / limiteSP) * 100);
    return Math.min(100, Math.max(0, calc || 0));
  }, [totalValidosSP, limiteSP]);

  const porcentCand1SP = useMemo(() => {
    if (totalValidosSP === 0) return '0.00';
    return ((candidato1SP / totalValidosSP) * 100).toFixed(2);
  }, [candidato1SP, totalValidosSP]);

  const porcentCand2SP = useMemo(() => {
    if (totalValidosSP === 0) return '0.00';
    return ((candidato2SP / totalValidosSP) * 100).toFixed(2);
  }, [candidato2SP, totalValidosSP]);

  // Celebração ao atingir 100%
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

  const seloFinal = useMemo(() => {
    if (porcentGeralSP !== 100) return null;
    if (Number(porcentCand1SP) > 50) return vitPolicia;
    if (Number(porcentCand2SP) > 50) return vitLadrao;
    return null;
  }, [porcentGeralSP, porcentCand1SP, porcentCand2SP]);

  const cand1Lider = Number(porcentCand1SP) > 50;
  const cand2Lider = Number(porcentCand2SP) > 50;

  const corBarraProgresso = useMemo(() => {
    if (Number(porcentCand1SP) > 50) return 'linear-gradient(90deg, #1f6feb, #2ea043)';
    if (Number(porcentCand2SP) > 50) return 'linear-gradient(90deg, #1f6feb, #da3633)';
    return 'linear-gradient(90deg, #30363d, #6e7681)';
  }, [porcentCand1SP, porcentCand2SP]);

  return (
    <div className={styles.porcentagem}>
      <div className={styles.result}>
        <div className={styles.logodindin}>
          <div
            className={styles.logo}
            onClick={toggleCorruption}
            role="button"
            tabIndex={0}
            title={corruption ? 'Fraude ATIVA' : 'Fraude DESATIVADA'}
          >
            <span
              className={styles.dindin}
              style={{ color: corruption ? '#f85149' : '#3fb950' }}
            >
              $UPER
            </span>
            <span>COMPUTER</span>
          </div>
        </div>

        <div className={styles.estatisticas}>
          <div className={styles.resultado}>
            <div className={styles.veleitores}>
              <p>
                Eleitores
                <strong className={styles.veleitores2}>{eleitoresTotais}</strong>
              </p>
            </div>
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

        <div className={styles.porcentagemtopo}>
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

      <div className={styles.barra1}>
        <div
          className={styles.barra2}
          style={{
            width: `${porcentGeralSP}%`,
            background: corBarraProgresso,
            transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1), background 600ms ease',
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

      {seloFinal && (
        <div className={styles.imagemfinal}>
          <img src={seloFinal} alt="Selo de Vitória" />
        </div>
      )}
    </div>
  );
}

export default SuperComputador;