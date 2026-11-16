// Aceita "1200", "1200,5" ou "1200.5" -> número (ou null se vazio)
export function paraNumero(texto) {
  const limpo = String(texto ?? "").trim().replace(",", ".");
  return limpo === "" ? null : Number(limpo);
}
