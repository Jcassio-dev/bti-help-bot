import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { emoji, fetchAprovacao, link, pct, renderGrouped } from "../utils/aprovacao";

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
        `🔗 Ou navegue por todos: ${link("professor", "")}`
      );
    }

    try {
      const items = await fetchAprovacao("docente", termo);
      if (items.length === 0) {
        return `Não achei professor com *"${termo}"*.\n🔗 Veja a lista: ${link("professor", termo)}`;
      }

      const maxGroups = isGroup ? 1 : 3;
      const maxPerGroup = isGroup ? 5 : 8;
      const body = renderGrouped(
        items,
        (i) => i.docenteNome ?? "—",
        (i) => `${emoji(i.taxa)} ${pct(i.taxa)}% — ${i.componenteNome ?? "—"} _(n=${i.total})_`,
        maxGroups,
        maxPerGroup
      );

      return `👨‍🏫 *Aprovação entre alunos de BTI*\n\n${body}\n\n🔗 ver todos / filtrar: ${link("professor", termo)}`;
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo em instantes.";
    }
  }
}
