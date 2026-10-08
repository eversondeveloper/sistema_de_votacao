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
    candidato1,
    setCandidato1,
    candidato2,
    setCandidato2,
    totalVotosReal,
    setTotalVotosReal,
    porcentCand1Real,
    setPorcentCand1Real,
    porcentCand2Real,
    porcentCand1,
    porcentCand2,
    totalValidos,
    comSom,
  } = useVoting();

  const [numAuto, setNumAuto] = useState(false);

  // Instâncias persistentes de áudio
  const audioTeclaRef = useRef(new Audio(somTeclas));
  const audioConfirmaRef = useRef(new Audio(somConfirmaAudio));
  const audioCand1Ref = useRef(new Audio(somCand1V));
  const audioCand2Ref = useRef(new Audio(somCand2V));

  const tocarAudio = useCallback((ref) => {
    if (comSom && ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  }, [comSom]);

  const candidatoNumero = Number(`${num1Digit}${num2Digit}`);
  const numeroValido = candidatoNumero === 44 || candidatoNumero === 11;
  const telaPreenchida = num2Digit !== "";

  // Dados do candidato na tela
  const dadosCandidato = useMemo(() => {
    if (candidatoNumero === 44) {
      return {
        nome: "Polícia",
        partido: "Patriótico",
        vice: "Outro Polícia",
        foto: fotoCand1,
        fotoVice: fotoCand1Vice,
      };
    }
    if (candidatoNumero === 11) {
      return {
        nome: "Ladrão",
        partido: "Sociopata",
        vice: "Outro Ladrão",
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

  // Áudio ao completar o número do candidato
  useEffect(() => {
    if (num1Digit === "4" && num2Digit === "4") {
      tocarAudio(audioCand1Ref);
    } else if (num1Digit === "1" && num2Digit === "1") {
      tocarAudio(audioCand2Ref);
    }
  }, [num1Digit, num2Digit, tocarAudio]);

  // Teclado numérico
  const preencheNumeros = (e) => {
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

  // Botões de comando da urna
  const handleVotoBranco = () => {
    tocarAudio(audioTeclaRef);
    setBtnBranco(true);
    setNum1Digit("");
    setNum2Digit("");
  };

  const handleCorrige = () => {
    tocarAudio(audioTeclaRef);
    setNum1Digit("");
    setNum2Digit("");
    setBtnBranco(false);
  };

  const handleConfirma = () => {
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

  // Automação da aplicação de votos
  useEffect(() => {
    if (!numAuto) return;

    const limiteNumerico = Number(totalVotosReal) || 0;
    if (totalValidos >= limiteNumerico) {
      setNumAuto(false);
      return;
    }

    const intervalo = setInterval(() => {
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

      setTimeout(() => {
        setNum1Digit("");
        setNum2Digit("");
      }, 200);
    }, 500);

    return () => clearInterval(intervalo);
  }, [numAuto, totalValidos, totalVotosReal, porcentCand1, porcentCand1Real, setCandidato1, setCandidato2, setNum1Digit, setNum2Digit]);

  const textoVisivel = (telaPreenchida && numeroValido) ? "#000000" : "transparent";
  const rodapeVisivel = (btnBranco || telaPreenchida) ? "#000000" : "transparent";
  const estiloBorda = (btnBranco || telaPreenchida) ? "2px solid #000000" : "none";

  return (
    <div className={styles.corpo}>
      <div className={styles.header}>
        {/* Painel de Controles da Votação */}
        <div className={styles.quantvotos}>
          <div className={styles.btnsplay}>
            <button
              type="button"
              className={styles.quantvotosbtn}
              onClick={() => {
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
                tocarAudio(audioTeclaRef);
                window.location.reload();
              }}
            >
              <img src={imgBtnReset} alt="Reset" title="Reinicia a aplicação." />
            </button>

            <div className={styles.controles}>
              <span>Polícia</span>
              <input
                title="Defina a porcentagem desejada do Candidato 1"
                type="number"
                min="0"
                max="100"
                className={styles.escolherporcentagem}
                value={porcentCand1Real}
                onChange={(e) => setPorcentCand1Real(e.target.value)}
              />
              % /
              <span>Ladrão</span>
              <div
                className={styles.escolherporcentagem2}
                title="Porcentagem calculada do Candidato 2"
              >
                {porcentCand2Real}
              </div>
              % /
              <span>Total de votos:</span>
              <input
                type="number"
                min="1"
                className={styles.escolherlimite}
                value={totalVotosReal}
                title="Meta de votos da apuração"
                onChange={(e) => setTotalVotosReal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Visor da Urna */}
        <div className={styles.tela}>
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
        </div>

        <div className={styles.adesivogeral}>
          <div className={styles.adesivo}>
            <h1>ever$cript</h1>
          </div>
        </div>
      </div>

      {/* Painel Central: Total Real */}
      <div className={styles.totalreal}>
        <div className={styles.tt}>
          <p>Brancos</p>
          <div className={styles.vbrancosreal}>{quantVBrancos}</div>
        </div>

        <div className={styles.tt}>
          <p>Nulos</p>
          <div className={styles.vnulosreal}>{quantVNulos}</div>
        </div>

        <div className={styles.tt}>
          <p>Polícia</p>
          <div className={styles.cand1}>{candidato1}</div>
        </div>

        <div className={styles.tt}>
          <p>Ladrão</p>
          <div className={styles.cand2}>{candidato2}</div>
        </div>

        <div className={styles.tt}>
          <p>Total Váls.</p>
          <div className={styles.totalcandtela}>{totalValidos}</div>
        </div>

        <div className={styles.tt}>
          <p>Polícia</p>
          <div
            style={{ backgroundColor: Number(porcentCand1) > 50 ? "yellow" : "white" }}
            className={styles.totalporcenttela1}
          >
            {porcentCand1}%
          </div>
        </div>

        <div className={styles.tt}>
          <p>Ladrão</p>
          <div
            style={{ backgroundColor: Number(porcentCand2) > 50 ? "yellow" : "white" }}
            className={styles.totalporcenttela2}
          >
            {porcentCand2}%
          </div>
        </div>
      </div>

      {/* Teclado Físico da Urna */}
      <div className={styles.botoescontainer}>
        <div className={styles.nome}>
          <div className={styles.logo}>
            <img src={imgCaveira} alt="Caveira de pirata" />
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
              className={styles.branco}
              title="Voto em Branco"
              onClick={handleVotoBranco}
            />
            <input
              type="button"
              value="Corrige"
              className={styles.corrige}
              title="Corrigir Voto"
              onClick={handleCorrige}
            />
            <input
              type="button"
              value="Confirma"
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