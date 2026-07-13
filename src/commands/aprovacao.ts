import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { emoji, fetchAprovacao, link, pct, renderGrouped } from "../utils/aprovacao";

export default class AprovacaoCommand extends BaseCommand {
  name = "aprovacao";
  description = "Taxa de aprovação por professor numa disciplina. Uso: !aprovacao <disciplina>";
  aliases = ["aprovação", "taxa"];
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
        `Consulta a aprovação por professor. Ex: *!aprovacao calculo 1*\n` +
        `Ou navegue por todas as disciplinas: ${link("disciplina", "")}`
      );
    }

    try {
      const items = await fetchAprovacao("disciplina", termo);
      if (items.length === 0) {
        return `Não achei disciplina com *"${termo}"*.\nVeja a lista: ${link("disciplina", termo)}`;
      }

      const maxGroups = isGroup ? 1 : 3;
      const maxPerGroup = isGroup ? 4 : 6;
      const body = renderGrouped(
        items,
        (i) => i.componenteNome ?? "(sem nome)",
        (i) => `${emoji(i.taxa)} *${pct(i.taxa)}%* ${i.docenteNome ?? "(não informado)"} (${i.total} alunos)`,
        maxGroups,
        maxPerGroup
      );

      return `*Aprovação entre alunos dos cursos de computação*\n\n${body}\n\nver todos / filtrar: ${link("disciplina", termo)}`;
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo em instantes.";
    }
  }
}
