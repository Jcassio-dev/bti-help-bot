import axios from "axios";
import { ICreateLogDTO } from "../types/api";

const client = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.API_SECRET_KEY,
  },
});

export async function registerLog({
  command,
  userId,
  groupId,
}: ICreateLogDTO): Promise<void> {
  try {
    const payload = {
      command,
      userId,
      groupId,
    };

    await client.post("/api/logs/command", payload);

    console.log(`[LOG] Comando '${command}' registrado com sucesso na API.`);
  } catch (error) {
    console.error("[LOG] Falha ao registrar comando na API:", error.message);
  }
}
