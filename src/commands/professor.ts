import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import {
  AprovacaoItem,
  LEGENDA,
  fetchAprovacao,
  fetchCobertura,
  linkBusca,
  linkProfessor,
  MEMORIAL_TEXTO,
  ehMemorial,
  nomeDocente,
  listaAprovacao,
} from "../utils/aprovacao";
import { tituloCase } from "../utils/titulo";

export default class ProfessorCommand extends BaseCommand {
  name = "professor";
  description = "Taxa de aprovação de um professor por disciplina. Uso: !professor <nome>";
  aliases = ["prof"];
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
        `Consulta a aprovação de um professor. Ex: *!professor maxwell*\n` +
        `Ou navegue por todos: ${linkBusca("")}`
      );
    }

    try {
      const items = await fetchAprovacao("docente", termo);
      if (items.length === 0) {
        const cob = await fetchCobertura();
        const aviso = cob
          ? `\nSe for professor novo, só temos dados até ${cob.ultimoSemestre}.`
          : "";
        return (
          `Não achei professor com *"${termo}"*.\n` +
          `Tente só o sobrenome.${aviso}\n${linkBusca(termo)}`
        );
      }

      const grupos = new Map<string, AprovacaoItem[]>();
      for (const i of items) {
        const chave = i.docenteNome ?? "";
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave)!.push(i);
      }

      const nomes = Array.from(grupos.keys());
      const limite = isGroup ? 6 : 15;

      if (nomes.length > 1) {
        const resumo = nomes
          .slice(0, 5)
          .map((n) => `• ${nomeDocente(n)} (${grupos.get(n)!.length} disciplinas)`)
          .join("\n");
        return (
          `Achei ${nomes.length} professores com *"${termo}"*.\n\n${resumo}\n\n` +
          `Refine com o sobrenome, ou veja no site:\n${linkBusca(termo)}`
        );
      }

      const nome = nomes[0];
      const turmas = grupos.get(nome)!;
      const corpo = listaAprovacao(turmas, (i) => tituloCase(i.componenteNome) || "(sem nome)", limite);
      const sobra = turmas.length - limite;
      const resto = sobra > 0 ? `\n_e mais ${sobra} disciplina${sobra === 1 ? "" : "s"}_` : "";
      const slug = turmas[0].docenteSlug;
      const url = slug ? linkProfessor(slug) : linkBusca(termo);

      const memorial = ehMemorial(nome) ? `\n${MEMORIAL_TEXTO}\n` : "";

      const cobertura = await fetchCobertura();
      const periodo = cobertura
        ? `últimos ${cobertura.semestres} semestres, até ${cobertura.ultimoSemestre}`
        : "últimos 10 semestres";

      return (
        `*${nomeDocente(nome)}*\n` +
        `Aprovação entre alunos dos cursos de computação, ${periodo}.\n\n` +
        `${corpo}${resto}\n` +
        `${LEGENDA}\n${memorial}\n` +
        `${url}`
      );
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo em instantes.";
    }
  }
}
