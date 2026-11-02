import { useState } from "react";
import "./simularFrete.css";
import ParametrosFrete from "../parametrosFrete/parametrosFrete";
import { paraNumero } from "./numeros";

// UC05 - Simular Frete
// Modal acionado a partir do formulário de agendamento (UC02).
//
// Props:
//  - freteAtual: frete já vinculado ao agendamento (ou null)          [FA04]
//  - aoConfirmar(dados): chamada ao confirmar o vínculo; recebe
//      { peso, distancia, dimensao, valor }. Pode ser assíncrona e
//      lançar erro (a mensagem é exibida no modal).                    [passo 6]
//  - aoFechar(): fecha o modal sem gravar nada                         [FA02 / RN07]

const API = "http://localhost:8080";

const formatarReais = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarNumero = (valor, casas = 2) =>
  Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

function SimularFrete({ freteAtual, aoConfirmar, aoFechar }) {
  // FA04 - se já existe frete, primeiro avisa que ele será substituído
  const [avisoSubstituicao, setAvisoSubstituicao] = useState(Boolean(freteAtual));

  const [peso, setPeso] = useState("");
  const [distancia, setDistancia] = useState("");
  // Dimensão em três campos; vai para o backend como um texto só "C x L x A"
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");

  // Alterna entre a simulação e a tela de parâmetros (tarifas)
  const [vendoParametros, setVendoParametros] = useState(false);
  const [mensagemInfo, setMensagemInfo] = useState("");

  const [resultado, setResultado] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagemErro, setMensagemErro] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  // FA03 - alterar qualquer parâmetro invalida o valor calculado
  function alterar(setter, campo) {
    return (event) => {
      setter(event.target.value);
      setResultado(null);
      setErros((atual) => ({ ...atual, [campo]: undefined, dimensao: undefined }));
      setMensagemErro("");
      setMensagemInfo("");
    };
  }

  // Validação no navegador (espelha RN01/RN02/RN03); o backend valida de novo
  function validarLocalmente() {
    const novosErros = {};
    const campos = [
      ["peso", peso, "O peso", "obrigatório"],
      ["distancia", distancia, "A distância", "obrigatória"],
      ["comprimento", comprimento, "O comprimento", "obrigatório"],
      ["largura", largura, "A largura", "obrigatória"],
      ["altura", altura, "A altura", "obrigatória"],
    ];

    for (const [campo, texto, nome, obrigatorio] of campos) {
      const n = paraNumero(texto);
      if (n === null) novosErros[campo] = `${nome} é ${obrigatorio}`;
      else if (Number.isNaN(n)) novosErros[campo] = "Informe um número válido";
      else if (n <= 0) novosErros[campo] = `${nome} deve ser maior que zero`;
    }

    return novosErros;
  }

  // Passos 3 e 4 - calcula o valor no backend
  async function calcular(event) {
    event.preventDefault();
    setMensagemErro("");
    setMensagemInfo("");
    setResultado(null);

    const errosLocais = validarLocalmente();
    setErros(errosLocais);
    if (Object.keys(errosLocais).length > 0) return; // FA01

    setCalculando(true);
    try {
      const resposta = await fetch(`${API}/fretes/simular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peso: paraNumero(peso),
          distancia: paraNumero(distancia),
          dimensao: `${comprimento.trim()} x ${largura.trim()} x ${altura.trim()}`,
        }),
      });

      const corpo = await resposta.json().catch(() => ({}));

      if (resposta.status === 400) {
        // FA01 - erros por campo; FA05 (sem tarifa) vem em "geral"
        setErros(corpo.erros ?? {});
        setMensagemErro(corpo.erros?.geral ?? (corpo.erros ? "" : corpo.mensagem));
        return;
      }
      if (!resposta.ok) {
        throw new Error(corpo.mensagem ?? "Não foi possível calcular o frete.");
      }

      setResultado(corpo);
    } catch (erro) {
      setMensagemErro(
        erro instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : erro.message
      );
    } finally {
      setCalculando(false);
    }
  }

  // Passo 5 - confirma o vínculo do frete ao agendamento
  async function confirmar() {
    setConfirmando(true);
    setMensagemErro("");
    try {
      await aoConfirmar({
        peso: resultado.peso,
        distancia: resultado.distancia,
        dimensao: resultado.dimensao,
        valor: resultado.valor,
      });
    } catch (erro) {
      setMensagemErro(erro.message);
      setConfirmando(false);
    }
  }

  const ocupado = calculando || confirmando;

  // Volta da tela de parâmetros; se foram salvos, o valor precisa ser recalculado
  function voltarDosParametros(salvou) {
    setVendoParametros(false);
    if (salvou) {
      setResultado(null);
      setMensagemErro("");
      setMensagemInfo("Parâmetros atualizados. Calcule o frete novamente.");
    }
  }

  return (
    <div className="simular-frete-fundo" role="dialog" aria-modal="true"
      aria-labelledby="simular-frete-titulo">
      <section className="simular-frete-card">
        <div className="simular-frete-cabecalho">
          <h2 id="simular-frete-titulo" className="simular-frete-titulo">
            {vendoParametros ? "Parâmetros do frete" : "Simular frete"}
          </h2>
          {!vendoParametros && (
            <button type="button" className="simular-frete-btn simular-frete-btn-pequeno"
              onClick={() => setVendoParametros(true)} disabled={ocupado}>
              Parâmetros
            </button>
          )}
        </div>

        {vendoParametros ? (
          <ParametrosFrete aoVoltar={voltarDosParametros} />
        ) : avisoSubstituicao ? (
          // ===== FA04 - Agendamento já possui frete =====
          <div className="simular-frete-aviso">
            <p><strong>Este agendamento já possui um frete vinculado:</strong></p>
            <ResumoFrete frete={freteAtual} />
            <p>
              Uma nova simulação confirmada <strong>substituirá</strong> o frete existente.
            </p>
            <div className="simular-frete-btns">
              <button type="button" className="simular-frete-btn" onClick={aoFechar}>
                Cancelar
              </button>
              <button type="button" className="simular-frete-btn simular-frete-btn-principal"
                onClick={() => setAvisoSubstituicao(false)}>
                Continuar
              </button>
            </div>
          </div>
        ) : (
          // ===== Passos 2 a 5 =====
          <form onSubmit={calcular} noValidate>
            <div className="simular-frete-campos">
              <Campo id="frete-peso" rotulo="Peso (kg)" placeholder="Ex.: 1200"
                valor={peso} aoAlterar={alterar(setPeso, "peso")}
                erro={erros.peso} desabilitado={ocupado} inputMode="decimal" />

              <Campo id="frete-distancia" rotulo="Distância (km)" placeholder="Ex.: 350"
                valor={distancia} aoAlterar={alterar(setDistancia, "distancia")}
                erro={erros.distancia} desabilitado={ocupado} inputMode="decimal" />

              <fieldset className="simular-frete-grupo">
                <legend>Dimensões da carga (m)</legend>
                <div className="simular-frete-medidas">
                  <Campo id="frete-comprimento" rotulo="Comprimento" placeholder="Ex.: 2,0"
                    valor={comprimento} aoAlterar={alterar(setComprimento, "comprimento")}
                    erro={erros.comprimento} desabilitado={ocupado} inputMode="decimal" />

                  <Campo id="frete-largura" rotulo="Largura" placeholder="Ex.: 1,5"
                    valor={largura} aoAlterar={alterar(setLargura, "largura")}
                    erro={erros.largura} desabilitado={ocupado} inputMode="decimal" />

                  <Campo id="frete-altura" rotulo="Altura" placeholder="Ex.: 1,8"
                    valor={altura} aoAlterar={alterar(setAltura, "altura")}
                    erro={erros.altura} desabilitado={ocupado} inputMode="decimal" />
                </div>
                {erros.dimensao && (
                  <span className="simular-frete-erro-campo">{erros.dimensao}</span>
                )}
              </fieldset>
            </div>

            {resultado && (
              <div className="simular-frete-resultado" role="status">
                <span>Valor estimado do frete</span>
                <strong className="simular-frete-valor">{formatarReais(resultado.valor)}</strong>
                <ul>
                  <li>Volume: {formatarNumero(resultado.volume, 3)} m³</li>
                  <li>Peso cubado: {formatarNumero(resultado.pesoCubado)} kg</li>
                  <li>Peso considerado: {formatarNumero(resultado.pesoTaxavel)} kg</li>
                  {resultado.valorMinimoAplicado && <li>Valor mínimo da tabela aplicado</li>}
                </ul>
                <small>* Valor estimado, não constitui cobrança.</small>
              </div>
            )}

            {mensagemInfo && (
              <p className="simular-frete-info" role="status">{mensagemInfo}</p>
            )}

            {mensagemErro && (
              <p className="simular-frete-erro" role="alert">{mensagemErro}</p>
            )}

            <div className="simular-frete-btns">
              {/* FA02 - Descartar */}
              <button type="button" className="simular-frete-btn" onClick={aoFechar}
                disabled={confirmando}>
                Descartar
              </button>

              {resultado ? (
                <button type="button" className="simular-frete-btn simular-frete-btn-principal"
                  onClick={confirmar} disabled={ocupado}>
                  {confirmando ? "Vinculando..." : "Vincular ao agendamento"}
                </button>
              ) : (
                <button type="submit" className="simular-frete-btn simular-frete-btn-principal"
                  disabled={ocupado}>
                  {calculando ? "Calculando..." : "Calcular"}
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export function Campo({ id, rotulo, placeholder, valor, aoAlterar, erro, desabilitado, inputMode, ajuda }) {
  return (
    <div className="simular-frete-campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type="text" inputMode={inputMode} placeholder={placeholder}
        value={valor} onChange={aoAlterar} disabled={desabilitado}
        aria-invalid={Boolean(erro)} className={erro ? "simular-frete-input-erro" : ""} />
      {ajuda && !erro && <span className="simular-frete-ajuda">{ajuda}</span>}
      {erro && <span className="simular-frete-erro-campo">{erro}</span>}
    </div>
  );
}

// Resumo de um frete já vinculado (usado no modal e nos formulários)
export function ResumoFrete({ frete }) {
  if (!frete) return null;
  return (
    <ul className="simular-frete-resumo">
      <li><span>Peso:</span> {formatarNumero(frete.peso)} kg</li>
      <li><span>Distância:</span> {formatarNumero(frete.distancia)} km</li>
      <li><span>Dimensão:</span> {frete.dimensao} m</li>
      <li><span>Valor estimado:</span> <strong>{formatarReais(frete.valor)}</strong></li>
    </ul>
  );
}

export default SimularFrete;
