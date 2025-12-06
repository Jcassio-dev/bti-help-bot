import { BaseCommand } from "../types/command";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../services/logger.service";

export class CommandManager {
  private static instance: CommandManager;
  private commands = new Map<string, BaseCommand>();

  private constructor() {}

  public static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  public async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      try {
        const cmdStartTime = Date.now();
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(filePath);
        const CommandClass = commandModule.default;
        if (!CommandClass || typeof CommandClass !== "function") {
          logger.warn({ file }, "Classe de comando inválida");
          continue;
        }
        const command = new CommandClass();
        if (
          !command ||
          !command.name ||
          typeof command.execute !== "function"
        ) {
          logger.warn({ file }, "Arquivo de comando inválido");
        } else {
          this.commands.set(command.name, command);
          if (command.aliases) {
            command.aliases.forEach((alias) =>
              this.commands.set(alias, command)
            );
          }
          logger.info({ commandName: command.name, loadTime: Date.now() - cmdStartTime }, "Comando carregado");
        }
      } catch (error) {
        logger.error({ error, file }, "Erro ao carregar comando");
      }
    }
  }

  public getCommand(name: string): BaseCommand | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): Map<string, BaseCommand> {
    return this.commands;
  }
}
