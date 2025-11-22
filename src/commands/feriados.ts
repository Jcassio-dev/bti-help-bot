import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import * as path from "path";
import * as fs from "fs";

type Feriado = { date: string; name: string };

export default class FeriadosCommand extends BaseCommand {
  name = "feriados";
  description = "Lista feriados restantes de 2025";
  aliases = ["feriado", "holidays"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        "resources",
        "feriados2025.json"
      );
      const raw = fs.readFileSync(filePath, "utf8");
      const feriados: Feriado[] = JSON.parse(raw);

      // Use the actual current date/time as reference so only future dates are shown
      const reference = new Date();

      const upcoming = feriados
        .map((f) => ({ ...f, dateObj: new Date(f.date) }))
        .filter((f) => f.dateObj >= reference)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      if (upcoming.length === 0)
        return "Não há feriados futuros registrados em 2025.";

      const lines = upcoming.map((f) => `${f.date} - ${f.name}`);

      const reply = ["Feriados restantes em 2025:", ...lines].join("\n");
      return reply;
    } catch (err) {
      console.error("Erro ao ler feriados:", err);
      return "Erro ao acessar lista de feriados.";
    }
  }
}
