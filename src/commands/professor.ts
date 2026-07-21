import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import {
  emoji,
  fetchAprovacao,
  link,
  pct,
  renderGrouped,
  textoHomenagemProfessor,
} from "../utils/aprovacao";

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
        `Ou navegue por todos: ${link("professor", "")}`
      );
    }

    try {
      const items = await fetchAprovacao("docente", termo);
      if (items.length === 0) {
        return `Não achei professor com *"${termo}"*.\nVeja a lista: ${link("professor", termo)}`;
      }

      const maxGroups = isGroup ? 1 : 4;
      const maxPerGroup = isGroup ? 6 : 20;
      const body = renderGrouped(
        items,
        (i) => i.docenteNome ?? "(não informado)",
        (i) => `${emoji(i.taxa)} *${pct(i.taxa)}%* ${i.componenteNome ?? "(sem nome)"} (${i.total} alunos)`,
        maxGroups,
        maxPerGroup,
        ["disciplina", "disciplinas"],
        ["professor encontrado", "professores encontrados"]
      );

      const profs = new Set(items.map((i) => i.docenteNome ?? "")).size;
      const rodape =
        profs > maxGroups
          ? `_Vários professores — seja mais específico no nome._\n\n*Ver todos e filtrar no site:*\n${link("professor", termo)}`
          : `*Ver todos e filtrar no site:*\n${link("professor", termo)}`;

      const homenagem = textoHomenagemProfessor(
        items.find((i) => (i.docenteNome ?? "").toLowerCase().includes("maxwell gomes da silva"))?.docenteNome
      );

      return `${homenagem}\n\n${body}\n\n${rodape}`;
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo em instantes.";
    }
  }
}
