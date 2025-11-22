import { BaseCommand } from "../types/command";
import { CommandManager } from "../core/command-manager";

export class CommandFactory {
  private commandManager = CommandManager.getInstance();

  public async loadCommands(): Promise<void> {
    await this.commandManager.loadCommands();
  }

  public createCommand(name: string): BaseCommand | null {
    return this.commandManager.getCommand(name) || null;
  }

  public createAllCommands(): Map<string, BaseCommand> {
    return this.commandManager.getAllCommands();
  }
}
