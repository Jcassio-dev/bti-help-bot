import axios, { AxiosInstance } from "axios";
import { ICreateLogDTO } from "../types/api";

export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_SECRET_KEY,
      },
    });
  }

  public async registerLog({
    command,
    userId,
    groupId,
  }: ICreateLogDTO): Promise<void> {
    try {
      const payload = { command, userId, groupId };
      await this.client.post("/api/logs/command", payload);
      console.log(`[LOG] Comando '${command}' registrado com sucesso na API.`);
    } catch (error) {
      console.error("[LOG] Falha ao registrar comando na API:", error.message);
    }
  }
}
