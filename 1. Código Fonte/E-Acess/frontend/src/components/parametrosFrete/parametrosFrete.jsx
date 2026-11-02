import { useEffect, useState } from "react";
import { Campo } from "../simularFrete/simularFrete";
import { paraNumero } from "../simularFrete/numeros";

// UC05 - Simular Frete [RN04]
// Visualiza e edita os parâmetros (tarifas) usados no cálculo do frete.
// Todos podem ver; somente o setor de Logística pode alterar.
//
// Props:
//  - aoVoltar(salvou): volta para a simulação; "salvou" indica se houve alteração

const API = "http://localhost:8080";

const CAMPOS = [
  {
    campo: "tarifaPorKg",
    rotulo: "Tarifa por quilo (R$/kg)",
    placeholder: "Ex.: 0,15",
    ajuda: "Cobrado sobre o peso considerado (o maior entre o real e o cubado).",
    minimoZero: false,
  },
  {
    campo: "tarifaPorKm",
    rotulo: "Tarifa por quilômetro (R$/km)",
    placeholder: "Ex.: 2,50",
    ajuda: "Cobrado sobre a distância percorrida.",
    minimoZero: false,
  },
  {
    campo: "fatorCubagem",
    rotulo: "Fator de cubagem (kg/m³)",
    placeholder: "Ex.: 300",
    ajuda: "Quantos kg vale cada m³ ocupado. ",
    minimoZero: false,
  },
  {
    campo: "valorMinimo",
    rotulo: "Valor mínimo do frete (R$)",
    placeholder: "Ex.: 150,00",
    ajuda: "Valor mínimo cobrado em frete.",
    minimoZero: true,
  },
];

const VAZIO = { tarifaPorKg: "", tarifaPorKm: "", fatorCubagem: "", valorMinimo: "" };

// 0.15 -> "0,15"
const paraTexto = (valor) => (valor == null ? "" : String(valor).replace(".", ","));

function usuarioPodeEditar() {
  try {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    return usuario?.setor === "LOGISTICA";
  } catch {
    return false;
  }
}

function ParametrosFrete({ aoVoltar }) {
  const podeEditar = usuarioPodeEditar();

  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [mensagemErro, setMensagemErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Carrega a tarifa vigente
  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetch(`${API}/fretes/tarifa`);
        if (resposta.status === 404) {
          setAviso("Nenhuma tarifa cadastrada. Preencha os valores e salve.");
          return;
        }
        if (!resposta.ok) throw new Error("Não foi possível carregar os parâmetros.");

        const tarifa = await resposta.json();
        setValores({
          tarifaPorKg: paraTexto(tarifa.tarifaPorKg),
          tarifaPorKm: paraTexto(tarifa.tarifaPorKm),
          fatorCubagem: paraTexto(tarifa.fatorCubagem),
          valorMinimo: paraTexto(tarifa.valorMinimo),
        });
      } catch (erro) {
        setMensagemErro(
          erro instanceof TypeError ? "Não foi possível conectar ao servidor." : erro.message
        );
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function alterar(campo) {
    return (event) => {
      setValores((atual) => ({ ...atual, [campo]: event.target.value }));
      setErros((atual) => ({ ...atual, [campo]: undefined }));
      setMensagemErro("");
    };
  }

  function validarLocalmente() {
    const novosErros = {};
    for (const { campo, minimoZero } of CAMPOS) {
      const n = paraNumero(valores[campo]);
      if (n === null) novosErros[campo] = "Campo obrigatório";
      else if (Number.isNaN(n)) novosErros[campo] = "Informe um número válido";
      else if (minimoZero ? n < 0 : n <= 0) {
        novosErros[campo] = minimoZero ? "Deve ser maior ou igual a zero" : "Deve ser maior que zero";
      }
    }
    return novosErros;
  }

  async function salvar(event) {
    event.preventDefault();
    setMensagemErro("");

    const errosLocais = validarLocalmente();
    setErros(errosLocais);
    if (Object.keys(errosLocais).length > 0) return;

    setSalvando(true);
    try {
      const corpo = Object.fromEntries(
        CAMPOS.map(({ campo }) => [campo, paraNumero(valores[campo])])
      );
      const resposta = await fetch(`${API}/fretes/tarifa`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const retorno = await resposta.json().catch(() => ({}));

      if (resposta.status === 400) {
        setErros(retorno.erros ?? {});
        setMensagemErro(retorno.erros ? "" : retorno.mensagem);
        return;
      }
      if (!resposta.ok) {
        throw new Error(retorno.mensagem ?? "Não foi possível salvar os parâmetros.");
      }

      aoVoltar(true);
    } catch (erro) {
      setMensagemErro(
        erro instanceof TypeError ? "Não foi possível conectar ao servidor." : erro.message
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p>Carregando parâmetros...</p>;
  }

  const bloqueado = !podeEditar || salvando;

  return (
    <form onSubmit={salvar} noValidate>
      {aviso && <p className="simular-frete-info">{aviso}</p>}

      <div className="simular-frete-campos">
        {CAMPOS.map(({ campo, rotulo, placeholder, ajuda }) => (
          <Campo key={campo} id={`parametro-${campo}`} rotulo={rotulo}
            placeholder={placeholder} ajuda={ajuda} inputMode="decimal"
            valor={valores[campo]} aoAlterar={alterar(campo)}
            erro={erros[campo]} desabilitado={bloqueado} />
        ))}
      </div>

      {!podeEditar && (
        <p className="simular-frete-info">
          Somente o setor de Logística pode alterar os parâmetros.
        </p>
      )}

      {mensagemErro && (
        <p className="simular-frete-erro" role="alert">{mensagemErro}</p>
      )}

      <div className="simular-frete-btns">
        <button type="button" className="simular-frete-btn" onClick={() => aoVoltar(false)}
          disabled={salvando}>
          Voltar
        </button>
        {podeEditar && (
          <button type="submit" className="simular-frete-btn simular-frete-btn-principal"
            disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        )}
      </div>
    </form>
  );
}

export default ParametrosFrete;
