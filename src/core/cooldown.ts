const cooldowns = new Map<string, number>();
const COOLDOWN_SECONDS = 30;

function getCooldownKey(userId: string, commandName: string): string {
  return `${userId}:${commandName}`;
}

export function checkCooldown(userId: string, commandName: string): number {
  const cooldownKey = getCooldownKey(userId, commandName);
  const expirationTime = cooldowns.get(cooldownKey);

  if (expirationTime && Date.now() < expirationTime) {
    const timeLeft = (expirationTime - Date.now()) / 1000;
    return Math.ceil(timeLeft);
  }

  return 0;
}

export function setCooldown(userId: string, commandName: string): void {
  const cooldownKey = getCooldownKey(userId, commandName);
  const expirationTime = Date.now() + COOLDOWN_SECONDS * 1000;
  cooldowns.set(cooldownKey, expirationTime);
}

function clearExpiredCooldowns() {
  const now = Date.now();
  cooldowns.forEach((expirationTime, key) => {
    if (now > expirationTime) {
      cooldowns.delete(key);
    }
  });
}

setInterval(clearExpiredCooldowns, COOLDOWN_SECONDS * 1000);

console.log("[COOLDOWN] Sistema de cooldown inicializado.");
