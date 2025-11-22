import { BaseCommand } from "../types/command";
import { CooldownService } from "../services/cooldown.service";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  timeLeft?: number;
}

export class UserValidator {
  constructor(private cooldownService: CooldownService) {}

  validateUser(
    userId: string,
    command: BaseCommand,
    subCommand?: string
  ): ValidationResult {
    const timeLeft = this.cooldownService.checkCooldown(
      userId,
      command.name,
      subCommand
    );

    if (timeLeft > 0) {
      return {
        valid: false,
        reason: "cooldown",
        timeLeft,
      };
    }

    return { valid: true };
  }

  setCooldown(userId: string, commandName: string, subCommand?: string): void {
    this.cooldownService.setCooldown(userId, commandName, subCommand);
  }
}
