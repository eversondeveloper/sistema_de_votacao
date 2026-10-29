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
import somCand1V from '../assets/audio/teclapolicia.mp3';
import somCand2V from '../assets/audio/teclaladrao.mp3';

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
    quantAbstencoes,
    setQuantAbstencoes,
    eleitoresTotais,
    setEleitoresTotais,
    totalVotosReal,
    porcentCand1Real,
    setPorcentCand1Real,
    porcentCand2Real,
    porcentAbstencaoMeta,
    setPorcentAbstencaoMeta,
    porcentBrancosMeta,
    setPorcentBrancosMeta,
    porcentNulosMeta,
    setPorcentNulosMeta,
    totalValidos,
    comSom,
  } = useVoting();

  const [numAuto, setNumAuto] = useState(false);
  const [sistemaTravado, setSistemaTravado] = useState(false);

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

  useEffect(() => {
    if (num1Digit === "4" && num2Digit === "4") {
      tocarAudio(audioCand1Ref);
    } else if (num1Digit === "1" && num2Digit === "1") {
      tocarAudio(audioCand2Ref);
    }
  }, [num1Digit, num2Digit, tocarAudio]);

  const preencheNumeros = (e) => {
    if (sistemaTravado) return;
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
    if (sistemaTravado) return;
    tocarAudio(audioTeclaRef);
    setBtnBranco(true);
    setNum1Digit("");
    setNum2Digit("");
  };

  const handleCorrige = () => {
    if (sistemaTravado) return;
    tocarAudio(audioTeclaRef);
    setNum1Digit("");
    setNum2Digit("");
    setBtnBranco(false);
  };

  const handleConfirma = () => {
    if (sistemaTravado) return;
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

  // Trava o sistema ao atingir a quantidade calculada de votos válidos
  useEffect(() => {
    const limiteNumerico = Number(totalVotosReal) || 0;
    if (totalValidos >= limiteNumerico && limiteNumerico > 0) {
      setNumAuto(false);
      setSistemaTravado(true);
    }
  }, [totalValidos, totalVotosReal]);

  // Simulação contínua e equilibrada em direção à meta configurada
  useEffect(() => {
    if (!numAuto || sistemaTravado) return;

    const limiteValidos = Number(totalVotosReal) || 0;
    if (totalValidos >= limiteValidos) {
      setNumAuto(false);
      setSistemaTravado(true);
      return;
    }

    const intervalo = setInterval(() => {
      const baseEleitores = Number(eleitoresTotais) || 1;
      const metaAbs = Math.round((baseEleitores * Number(porcentAbstencaoMeta)) / 100);
      const metaBra = Math.round((baseEleitores * Number(porcentBrancosMeta)) / 100);
      const metaNul = Math.round((baseEleitores * Number(porcentNulosMeta)) / 100);

      if (quantAbstencoes < metaAbs) setQuantAbstencoes((prev) => prev + 1);
      if (quantVBrancos < metaBra) setQuantVBrancos((prev) => prev + 1);
      if (quantVNulos < metaNul) setQuantVNulos((prev) => prev + 1);

      // Decisão dinâmica baseada na proporção corrente de votos válidos
      const metaP1Porcent = Number(porcentCand1Real) || 50;
      const proporcaoAtualP1 = totalValidos > 0 ? (candidato1 / totalValidos) * 100 : 0;
      const votaP1 = proporcaoAtualP1 < metaP1Porcent;

      if (votaP1) {
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
      }, 150);
    }, 600);

    return () => clearInterval(intervalo);
  }, [
    numAuto,
    sistemaTravado,
    totalValidos,
    totalVotosReal,
    eleitoresTotais,
    candidato1,
    candidato2,
    porcentCand1Real,
    porcentAbstencaoMeta,
    porcentBrancosMeta,
    porcentNulosMeta,
    quantAbstencoes,
    quantVBrancos,
    quantVNulos,
    setCandidato1,
    setCandidato2,
    setQuantAbstencoes,
    setQuantVBrancos,
    setQuantVNulos,
    setNum1Digit,
    setNum2Digit,
  ]);

  const textoVisivel = (telaPreenchida && numeroValido) ? "#000000" : "transparent";
  const rodapeVisivel = (btnBranco || telaPreenchida) ? "#000000" : "transparent";
  const estiloBorda = (btnBranco || telaPreenchida) ? "2px solid #000000" : "none";

  const pCand1Urna = totalValidos > 0 ? ((candidato1 / totalValidos) * 100).toFixed(2) : "0.00";
  const pCand2Urna = totalValidos > 0 ? ((candidato2 / totalValidos) * 100).toFixed(2) : "0.00";

  return (
    <div className={styles.corpo}>
      <div className={styles.header}>
        <div className={styles.quantvotos}>
          <div className={styles.btnsplay}>
            <button
              type="button"
              className={styles.quantvotosbtn}
              disabled={sistemaTravado}
              style={{ opacity: sistemaTravado ? 0.4 : 1, cursor: sistemaTravado ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (sistemaTravado) return;
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
              <img src={imgBtnReset} alt="Reset" title="Reinicia e destrava a aplicação." />
            </button>

            <div className={styles.controles}>
              <span>Polícia</span>
              <input
                title="Defina a porcentagem desejada do Candidato 1"
                type="number"
                min="0"
                max="100"
                disabled={sistemaTravado}
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
              <span>Abstenção(%)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                disabled={sistemaTravado}
                className={styles.escolherporcentagem}
                value={porcentAbstencaoMeta}
                title="Meta de abstenções"
                onChange={(e) => setPorcentAbstencaoMeta(e.target.value)}
              />
              /
              <span>Brancos(%)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                disabled={sistemaTravado}
                className={styles.escolherporcentagem}
                value={porcentBrancosMeta}
                title="Meta de votos brancos"
                onChange={(e) => setPorcentBrancosMeta(e.target.value)}
              />
              /
              <span>Nulos(%)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                disabled={sistemaTravado}
                className={styles.escolherporcentagem}
                value={porcentNulosMeta}
                title="Meta de votos nulos"
                onChange={(e) => setPorcentNulosMeta(e.target.value)}
              />
              /
              <span>Eleitores:</span>
              <input
                type="number"
                min="1"
                disabled={sistemaTravado}
                className={styles.escolherlimite}
                value={eleitoresTotais}
                title="Total de eleitores cadastrados"
                onChange={(e) => setEleitoresTotais(e.target.value)}
              />
              /
              <span>Válidos:</span>
              <div
                className={styles.escolherporcentagem2}
                title="Votos válidos calculados (Eleitores - Abstenções - Brancos - Nulos)"
                style={{ fontWeight: 'bold' }}
              >
                {totalVotosReal}
              </div>
            </div>
          </div>
        </div>

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
            <h1>@everson_eng_soft</h1>
          </div>
        </div>
      </div>

      <div className={styles.totalreal}>
        <div className={styles.tt}>
          <p>Eleitores</p>
          <div className={styles.veleitoresreal}>{eleitoresTotais}</div>
        </div>

        <div className={styles.tt}>
          <p>Abstenção</p>
          <div className={styles.vabstenreal}>{quantAbstencoes}</div>
        </div>

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
            style={{ backgroundColor: Number(pCand1Urna) > 50 ? "yellow" : "white" }}
            className={styles.totalporcenttela1}
          >
            {pCand1Urna}%
          </div>
        </div>

        <div className={styles.tt}>
          <p>Ladrão</p>
          <div
            style={{ backgroundColor: Number(pCand2Urna) > 50 ? "yellow" : "white" }}
            className={styles.totalporcenttela2}
          >
            {pCand2Urna}%
          </div>
        </div>
      </div>

      <div
        className={styles.botoescontainer}
        style={{
          opacity: sistemaTravado ? 0.45 : 1,
          pointerEvents: sistemaTravado ? 'none' : 'auto',
          transition: 'opacity 300ms ease'
        }}
      >
        <div className={styles.nome}>
          <div className={styles.logo}>
            <img src={imgCaveira} alt="Caveira de pirata" />
          </div>
          <div className={styles.nomedaurna}>
            <p>Tigrinho</p>
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