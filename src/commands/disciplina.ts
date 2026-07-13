import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { emoji, fetchAprovacao, link, pct, renderGrouped } from "../utils/aprovacao";

export default class DisciplinaCommand extends BaseCommand {
  name = "disciplina";
  description = "Taxa de aprovação por professor numa disciplina. Uso: !disciplina <nome>";
  aliases = ["aprovacao", "aprovação", "taxa"];
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
        `Consulta a aprovação por professor. Ex: *!disciplina calculo 1*\n` +
        `Ou navegue por todas as disciplinas: ${link("disciplina", "")}`
      );
    }

    try {
      const items = await fetchAprovacao("disciplina", termo);
      if (items.length === 0) {
        return `Não achei disciplina com *"${termo}"*.\nVeja a lista: ${link("disciplina", termo)}`;
      }

      const maxGroups = isGroup ? 2 : 3;
      const maxPerGroup = isGroup ? 3 : 6;
      const body = renderGrouped(
        items,
        (i) => i.componenteNome ?? "(sem nome)",
        (i) => `${emoji(i.taxa)} *${pct(i.taxa)}%* ${i.docenteNome ?? "(não informado)"} (${i.total} alunos)`,
        maxGroups,
        maxPerGroup,
        ["professor", "professores"],
        ["matéria encontrada", "matérias encontradas"]
      );

      return (
        `*Aprovação entre alunos dos cursos de computação*\n\n${body}\n\n` +
        `*Ver todos e filtrar no site:*\n${link("disciplina", termo)}`
      );
    } catch (error) {
      return "Ops, não consegui consultar a taxa agora. Tenta de novo em instantes.";
    }
  }
}
