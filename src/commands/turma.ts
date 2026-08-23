import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import {
  AprovacaoItem,
  LEGENDA,
  fetchAprovacao,
  linkBusca,
  linkTurma,
  nomeDocente,
  listaAprovacao,
} from "../utils/aprovacao";
import { tituloCase } from "../utils/titulo";

export default class TurmaCommand extends BaseCommand {
  name = "turma";
  description = "Taxa de aprovação por professor numa disciplina. Uso: !turma calculo 1";
  aliases = ["disciplina", "aprovacao", "aprovação", "taxa"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const isGroup = msg.key.remoteJid?.endsWith("@g.us") ?? false;
    const termo = args.join(" ").trim();

    if (!termo) {
      return (
        `Consulta a aprovação por professor numa disciplina. Ex: *!turma calculo 1* ou *!turma mat0031*\n` +
        `Ou navegue por todas: ${linkBusca("")}`
      );
    }

    try {
      const items = await fetchAprovacao("disciplina", termo);
      if (items.length === 0) {
        return (
          `Não achei disciplina com *"${termo}"*.\n` +
          `Tente o código (ex: *MAT0031*) ou parte do nome.\n${linkBusca(termo)}`
        );
      }

      const grupos = new Map<string, AprovacaoItem[]>();
      for (const i of items) {
        const chave = i.componenteNome ?? "";
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave)!.push(i);
      }

      const nomes = Array.from(grupos.keys());
      const limite = isGroup ? 6 : 15;

      if (nomes.length > 1) {
        const resumo = nomes
          .slice(0, 5)
          .map((n) => {
            const codigo = grupos.get(n)![0].componenteCodigo ?? "";
            return `• *${codigo}* ${tituloCase(n)}`;
          })
          .join("\n");
        return (
          `Achei ${nomes.length} disciplinas com *"${termo}"*.\n\n${resumo}\n\n` +
          `Refine com o número (ex: *${termo} 1*), ou veja no site:\n${linkBusca(termo)}`
        );
      }

      const nome = tituloCase(nomes[0]);
      const turmas = grupos.get(nomes[0])!;
      const codigo = turmas[0].componenteCodigo ?? "";
      const corpo = listaAprovacao(turmas, (i) => nomeDocente(i.docenteNome), limite);
      const sobra = turmas.length - limite;
      const resto = sobra > 0 ? `\n_e mais ${sobra} professor${sobra === 1 ? "" : "es"}_` : "";
      const url = codigo ? linkTurma(codigo) : linkBusca(termo);

      return (
        `*${codigo} ${nome}*\n` +
        `Aprovação entre alunos dos cursos de computação, últimos 10 semestres.\n\n` +
        `${corpo}${resto}\n` +
        `${LEGENDA}\n\n` +
        `${url}`
      );
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo depois.";
    }
  }
}
