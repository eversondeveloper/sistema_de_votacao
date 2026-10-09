/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import styles from './urna.module.css';
import { useVoting } from '../context/VotingContext';

import imgCaveira from '../assets/img/pngegg.png';
import fotoCand1 from '../assets/img/policia.jpg';
import fotoCand1Vice from '../assets/img/outropolicia.jpg';
import fotoCand2 from '../assets/img/bandido.jpg';
import fotoCand2Vice from '../assets/img/outrobandido.jpg';
import imgBtnPlay from '../assets/img/btnplay.png';
import imgBtnPause from '../assets/img/btnpause2.png';
import imgBtnReset from '../assets/img/btnreset.png';

import somTeclas from '../assets/audio/tecla1.mp3';
import somConfirmaAudio from '../assets/audio/confirma.mp3';
import somCand1V from '../assets/audio/teclapolicia.wav';
import somCand2V from '../assets/audio/teclaladrao.wav';

function Urna() {
  const {
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
    totalValidos,
    totalGeral,
    comSom,
    vencedor,
  } = useVoting();

  const [numAuto, setNumAuto] = useState(false);

  const audioTeclaRef = useRef(new Audio(somTeclas));
  const audioConfirmaRef = useRef(new Audio(somConfirmaAudio));
  const audioCand1Ref = useRef(new Audio(somCand1V));
  const audioCand2Ref = useRef(new Audio(somCand2V));

  const estaBloqueado = Boolean(vencedor);

  const tocarAudio = useCallback((ref) => {
    if (comSom && ref.current && !estaBloqueado) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  }, [comSom, estaBloqueado]);

  const candidatoNumero = Number(`${num1Digit}${num2Digit}`);
  const numeroValido = candidatoNumero === 44 || candidatoNumero === 11;
  const telaPreenchida = num2Digit !== "";

  const dadosCandidato = useMemo(() => {
    if (candidatoNumero === 44) {
      return {
        nome: "Candidato 1",
        partido: "Patriótico",
        vice: "Vice Candidato 1",
        foto: fotoCand1,
        fotoVice: fotoCand1Vice,
      };
    }
    if (candidatoNumero === 11) {
      return {
        nome: "Candidato 2",
        partido: "Sociopata",
        vice: "Vice Candidato 2",
        foto: fotoCand2,
        fotoVice: fotoCand2Vice,
      };
    }
    return {
      nome: "",
      partido: "",
      vice: "",
      foto: null,
      fotoVice: null,
    };
  }, [candidatoNumero]);

  useEffect(() => {
    if (estaBloqueado) return;
    if (num1Digit === "4" && num2Digit === "4") {
      tocarAudio(audioCand1Ref);
    } else if (num1Digit === "1" && num2Digit === "1") {
      tocarAudio(audioCand2Ref);
    }
  }, [num1Digit, num2Digit, tocarAudio, estaBloqueado]);

  const preencheNumeros = (e) => {
    if (estaBloqueado) return;
    const valor = e.target.value;
    if (num1Digit === "" || num2Digit === "") {
      tocarAudio(audioTeclaRef);
    }

    if (num1Digit === "") {
      setNum1Digit(valor);
    } else if (num2Digit === "") {
      setNum2Digit(valor);
    }
  };

  const handleVotoBranco = () => {
    if (estaBloqueado) return;
    tocarAudio(audioTeclaRef);
    setBtnBranco(true);
    setNum1Digit("");
    setNum2Digit("");
  };

  const handleCorrige = () => {
    if (estaBloqueado) return;
    tocarAudio(audioTeclaRef);
    setNum1Digit("");
    setNum2Digit("");
    setBtnBranco(false);
  };

  const handleConfirma = () => {
    if (estaBloqueado) return;
    tocarAudio(audioConfirmaRef);

    if (btnBranco) {
      setQuantVBrancos((prev) => prev + 1);
      setBtnBranco(false);
      setNum1Digit("");
      setNum2Digit("");
      return;
    }

    if (num1Digit === "" && num2Digit === "") {
      alert("Você ainda não digitou nenhum número.");
      return;
    }

    if (candidatoNumero === 44) {
      setCandidato1((prev) => prev + 1);
    } else if (candidatoNumero === 11) {
      setCandidato2((prev) => prev + 1);
    } else if (telaPreenchida) {
      setQuantVNulos((prev) => prev + 1);
    }

    setNum1Digit("");
    setNum2Digit("");
  };

  useEffect(() => {
    if (estaBloqueado && numAuto) {
      setNumAuto(false);
    }
  }, [estaBloqueado, numAuto]);

  useEffect(() => {
    if (!numAuto || estaBloqueado) return;

    const metaTotal = Number(totalVotosReal) || 0;
    const metaBrancos = Number(quantBrancosReal) || 0;
    const metaNulos = Number(quantNulosReal) || 0;
    const metaAbstencoes = Number(quantAbstencoesReal) || 0;

    if (totalGeral >= metaTotal) {
      setNumAuto(false);
      return;
    }

    const intervalo = setInterval(() => {
      if (quantAbstencoes < metaAbstencoes && Math.random() < 0.25) {
        setQuantAbstencoes((prev) => prev + 1);
        return;
      }

      if (quantVBrancos < metaBrancos && Math.random() < 0.3) {
        setBtnBranco(true);
        tocarAudio(audioTeclaRef);
        setTimeout(() => {
          tocarAudio(audioConfirmaRef);
          setQuantVBrancos((prev) => prev + 1);
          setBtnBranco(false);
        }, 200);
        return;
      }

      if (quantVNulos < metaNulos && Math.random() < 0.3) {
        setNum1Digit("9");
        setNum2Digit("9");
        tocarAudio(audioTeclaRef);
        setTimeout(() => {
          tocarAudio(audioConfirmaRef);
          setQuantVNulos((prev) => prev + 1);
          setNum1Digit("");
          setNum2Digit("");
        }, 200);
        return;
      }

      if (totalValidos < totalValidosEsperados) {
        const p1Atual = Number(porcentCand1);
        const metaP1 = Number(porcentCand1Real);

        if (p1Atual < metaP1) {
          setCandidato1((prev) => prev + 1);
          setNum1Digit("4");
          setNum2Digit("4");
        } else {
          setCandidato2((prev) => prev + 1);
          setNum1Digit("1");
          setNum2Digit("1");
        }

        tocarAudio(audioConfirmaRef);
        setTimeout(() => {
          setNum1Digit("");
          setNum2Digit("");
        }, 200);
      }
    }, 500);

    return () => clearInterval(intervalo);
  }, [
    numAuto,
    estaBloqueado,
    totalGeral,
    totalVotosReal,
    totalValidos,
    totalValidosEsperados,
    quantVBrancos,
    quantBrancosReal,
    quantVNulos,
    quantNulosReal,
    quantAbstencoes,
    quantAbstencoesReal,
    porcentCand1,
    porcentCand1Real,
  ]);

  const textoVisivel = (telaPreenchida && numeroValido) ? "#000000" : "transparent";
  const rodapeVisivel = (btnBranco || telaPreenchida) ? "#000000" : "transparent";
  const estiloBorda = (btnBranco || telaPreenchida) ? "2px solid #000000" : "none";

  const liderCand1 = Number(porcentCand1) > 50;
  const liderCand2 = Number(porcentCand2) > 50;

  return (
    <div className={`${styles.corpo} ${estaBloqueado ? styles.urnaInativa : ''}`}>
      <div className={styles.header}>
        {/* 1. HUD CYBER: REGISTRO FÍSICO DA URNA (COLADO NO TOPO) */}
        <div className={styles.totalrealHorizontal}>
          <div className={styles.totalrealHeader}>
            <span className={styles.hudTitle}>REGISTRO FÍSICO DA URNA (REAL)</span>
            <span className={styles.hudBadge}>APURAÇÃO LOCAL</span>
          </div>

          <div className={styles.totalrealGrid}>
            <div className={styles.tt}>
              <span className={styles.ttLabel}>Brancos</span>
              <div className={styles.vbrancosreal}>{quantVBrancos}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>Nulos</span>
              <div className={styles.vnulosreal}>{quantVNulos}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>Abstenções</span>
              <div className={styles.vabstreal}>{quantAbstencoes}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>Cand. 1</span>
              <div className={styles.cand1}>{candidato1}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>Cand. 2</span>
              <div className={styles.cand2}>{candidato2}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>Válidos</span>
              <div className={styles.totalcandtela}>{totalValidos}</div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>% Cand. 1</span>
              <div className={`${styles.totalporcenttela1} ${liderCand1 ? styles.liderText : ''}`}>
                {porcentCand1}%
              </div>
            </div>

            <div className={styles.tt}>
              <span className={styles.ttLabel}>% Cand. 2</span>
              <div className={`${styles.totalporcenttela2} ${liderCand2 ? styles.liderText : ''}`}>
                {porcentCand2}%
              </div>
            </div>
          </div>
        </div>

        {/* 2. VISOR DA URNA */}
        <div className={styles.tela}>
          {vencedor ? (
            <div className={styles.seloVencedorContainer}>
              <img src={vencedor.selo} alt="Vencedor" className={styles.seloVencedorImg} />
            </div>
          ) : (
            <div className={styles.telageral}>
              <div className={styles.tela1} style={{ borderBottom: estiloBorda }}>
                <div className={styles.tela1esq}>
                  <div className={styles.frasetopo}>
                    <p style={{ color: textoVisivel }}>Seu voto para</p>
                  </div>

                  <div className={styles.cargo}>
                    <h1>Presidente</h1>
                  </div>

                  <div className={styles.inputs}>
                    <div>
                      <div className={styles.numeropalavra}>
                        <p style={{ color: textoVisivel }}>Número:</p>
                      </div>
                      <div className={styles.numerocandidato}>
                        <div className={styles.numero1}>{num1Digit}</div>
                        <div className={styles.numero2}>{num2Digit}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.votoembranco1}>
                    <div className={styles.nomecandidato}>
                      <p style={{ color: textoVisivel }}>Nome: {dadosCandidato.nome}</p>
                    </div>
                    <div className={styles.partido}>
                      <p style={{ color: textoVisivel }}>Partido: {dadosCandidato.partido}</p>
                    </div>
                    <div className={styles.vicepresidente}>
                      <p style={{ color: textoVisivel }}>Vice-Presidente: {dadosCandidato.vice}</p>
                    </div>
                  </div>
                </div>

                {numeroValido && (
                  <div className={styles.teladir}>
                    <div className={styles.fotopresidente}>
                      <div className={styles.fotops}>
                        <img src={dadosCandidato.foto} alt="Foto Presidente" />
                      </div>
                      <p style={{ color: textoVisivel }}>Presidente</p>
                    </div>

                    <div className={styles.fotovicepresidente}>
                      <div className={styles.fotoviceps}>
                        <img src={dadosCandidato.fotoVice} alt="Foto Vice-Presidente" />
                      </div>
                      <p style={{ color: textoVisivel }}>Vice-Presidente</p>
                    </div>
                  </div>
                )}

                {telaPreenchida && !numeroValido && !btnBranco && (
                  <div className={styles.votonulo}>Voto Nulo</div>
                )}

                {btnBranco && (
                  <div className={styles.votonulo}>Voto em Branco</div>
                )}
              </div>

              <div className={styles.telarodape}>
                <p style={{ color: rodapeVisivel }}>Aperte a tecla:</p>
                <p style={{ color: rodapeVisivel }}>CONFIRMA para CONFIRMAR este voto</p>
                <p style={{ color: rodapeVisivel }}>CORRIGE para REINICIAR este voto</p>
              </div>
            </div>
          )}
        </div>

        {/* 3. SIMULADOR / PLAYER REORGANIZADO EM LINHA FLUIDA */}
        <div className={styles.quantvotos}>
          <div className={styles.playerLeft}>
            <button
              type="button"
              className={styles.quantvotosbtn}
              disabled={estaBloqueado}
              style={{ opacity: estaBloqueado ? 0.3 : 1, cursor: estaBloqueado ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (estaBloqueado) return;
                tocarAudio(audioTeclaRef);
                setNumAuto((prev) => !prev);
              }}
            >
              <img
                src={numAuto ? imgBtnPause : imgBtnPlay}
                alt={numAuto ? "Pausar" : "Iniciar"}
                title="Inicia ou pausa a simulação automática dos votos."
              />
            </button>

            <button
              type="button"
              className={styles.resetbtn}
              onClick={() => {
                window.location.reload();
              }}
            >
              <img src={imgBtnReset} alt="Reset" title="Reinicia a aplicação." />
            </button>
          </div>

          <div
            className={styles.controlesGrid}
            style={{ opacity: estaBloqueado ? 0.4 : 1, pointerEvents: estaBloqueado ? 'none' : 'auto' }}
          >
            <div className={styles.controlField}>
              <span className={styles.controlLabel}>C1:</span>
              <input
                type="number"
                min="0"
                max="100"
                disabled={estaBloqueado}
                className={styles.controlInput}
                value={porcentCand1Real}
                onChange={(e) => setPorcentCand1Real(e.target.value)}
                title="Meta de porcentagem para o Candidato 1"
              />
              <span className={styles.controlLabel}>%</span>
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>C2:</span>
              <div className={styles.controlDisplay} title="Meta calculada para o Candidato 2">
                {porcentCand2Real}%
              </div>
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>Totais:</span>
              <input
                type="number"
                min="1"
                disabled={estaBloqueado}
                className={styles.controlInput}
                style={{ width: '5.5vmin' }}
                value={totalVotosReal}
                onChange={(e) => setTotalVotosReal(e.target.value)}
                title="Meta total de eleitores na urna"
              />
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>Válidos:</span>
              <div className={styles.controlDisplay} title="Total de válidos esperados">
                {totalValidosEsperados}
              </div>
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>Brancos:</span>
              <input
                type="number"
                min="0"
                disabled={estaBloqueado}
                className={styles.controlInput}
                value={quantBrancosReal}
                onChange={(e) => setQuantBrancosReal(e.target.value)}
                title="Meta de votos em branco"
              />
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>Nulos:</span>
              <input
                type="number"
                min="0"
                disabled={estaBloqueado}
                className={styles.controlInput}
                value={quantNulosReal}
                onChange={(e) => setQuantNulosReal(e.target.value)}
                title="Meta de votos nulos"
              />
            </div>

            <div className={styles.controlField}>
              <span className={styles.controlLabel}>Abst.:</span>
              <input
                type="number"
                min="0"
                disabled={estaBloqueado}
                className={styles.controlInput}
                value={quantAbstencoesReal}
                onChange={(e) => setQuantAbstencoesReal(e.target.value)}
                title="Meta de abstenções"
              />
            </div>
          </div>
        </div>

        {/* 4. SELO EVER$CRIPT */}
        <div className={styles.adesivogeral}>
          <div className={styles.adesivo}>
            <h1>ever$cript</h1>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: TECLADO DA URNA */}
      <div className={styles.botoescontainer} style={{ pointerEvents: estaBloqueado ? 'none' : 'auto', opacity: estaBloqueado ? 0.6 : 1 }}>
        <div className={styles.nome}>
          <div className={styles.logo}>
            <img src={imgCaveira} alt="Caveira" />
          </div>
          <div className={styles.nomedaurna}>
            <p>Pirataria</p>
            <p>Eleitoral</p>
          </div>
        </div>

        <div className={styles.botoes}>
          <div className={styles.btn1}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
              <input
                key={num}
                type="button"
                value={num}
                disabled={estaBloqueado}
                className={styles[`bton${num}`]}
                onClick={preencheNumeros}
                title={`Tecla ${num}`}
              />
            ))}
          </div>

          <div className={styles.btn2}>
            <input
              type="button"
              value="Branco"
              disabled={estaBloqueado}
              className={styles.branco}
              title="Voto em Branco"
              onClick={handleVotoBranco}
            />
            <input
              type="button"
              value="Corrige"
              disabled={estaBloqueado}
              className={styles.corrige}
              title="Corrigir Voto"
              onClick={handleCorrige}
            />
            <input
              type="button"
              value="Confirma"
              disabled={estaBloqueado}
              className={styles.confirma}
              title="Confirmar Voto"
              onClick={handleConfirma}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Urna;