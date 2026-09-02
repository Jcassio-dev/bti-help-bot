type Tarefa = () => Promise<void>;

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

/** Roda a tarefa agora e depois toda dia no horario (hora local, UTC-3). */
export function agendarDiario(nome: string, hora: number, tarefa: Tarefa): void {
  const rodar = () =>
    tarefa().catch((e) => console.error(`[agenda] ${nome} falhou:`, e));

  rodar();

  setTimeout(() => {
    rodar();
    setInterval(rodar, DIA);
  }, msAteProxima(hora));
}

function msAteProxima(hora: number): number {
  const agora = new Date(Date.now() - 3 * HORA);
  const alvo = new Date(agora);
  alvo.setUTCHours(hora, 0, 0, 0);
  if (alvo <= agora) {
    alvo.setUTCDate(alvo.getUTCDate() + 1);
  }
  return alvo.getTime() - agora.getTime();
}
