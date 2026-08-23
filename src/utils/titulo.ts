const CONECTIVOS = new Set([
  "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas",
  "a", "o", "as", "os", "ao", "aos", "para", "com", "por", "sob", "sobre",
]);

const ROMANO = /^(?:i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/;

function palavra(p: string, primeira: boolean): string {
  if (!p) return p;
  const baixa = p.toLocaleLowerCase("pt-BR");
  if (ROMANO.test(baixa)) return baixa.toLocaleUpperCase("pt-BR");
  if (!primeira && CONECTIVOS.has(baixa)) return baixa;
  return baixa.charAt(0).toLocaleUpperCase("pt-BR") + baixa.slice(1);
}

export function tituloCase(texto?: string | null): string {
  if (!texto) return "";
  const bruto = texto.trim();
  if (bruto !== bruto.toLocaleUpperCase("pt-BR")) return bruto;

  let indice = 0;
  return bruto
    .split(/(\s+)/)
    .map((parte) => {
      if (/^\s+$/.test(parte)) return parte;
      const saida = parte
        .split("-")
        .map((p, i) => palavra(p, indice === 0 && i === 0))
        .join("-");
      indice++;
      return saida;
    })
    .join("");
}
