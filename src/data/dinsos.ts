import { MOCK_USERS } from "./mockData";
import { UserRecord } from "../services/StorageService";

export type DinsosRecord = UserRecord & { status: "GAKIN" };

export const MOCK_DINSOS_DB: DinsosRecord[] = MOCK_USERS
  .filter(u => u.gakinStatus === "GAKIN")
  .map(u => ({
    ...u,
    status: "GAKIN" as const,
  }));

export async function checkDinsosData(nik: string): Promise<DinsosRecord | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const found = MOCK_DINSOS_DB.find(record => record.nik === nik);
      resolve(found || null);
    }, 400); 
  });
}
