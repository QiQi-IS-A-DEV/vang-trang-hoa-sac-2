import type { MemoryMessage, MessageInput } from "@/types";
import { parseMessage } from "./validation";
export { validateMessage, messageLimits } from "./validation";

export function mergeMessages(current: MemoryMessage[], incoming: MemoryMessage[]) {
  const unique = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => unique.set(message.id, message));
  return [...unique.values()].sort((a, b) => b.slot_index - a.slot_index);
}

async function apiResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không kết nối được dữ liệu lời nhắn.");
  return data;
}

export async function fetchMessages() {
  const result: MemoryMessage[] = [];
  let cursor: number | null = null;
  do {
    const params = new URLSearchParams({ limit: "500" });
    if (cursor !== null) params.set("after", String(cursor));
    const data = await apiResponse(await fetch(`/api/messages?${params}`, { cache: "no-store" }));
    result.push(...data.items);
    cursor = data.next_cursor;
  } while (cursor !== null);
  return result;
}

export async function submitMessage(input: MessageInput): Promise<MemoryMessage> {
  const normalized = parseMessage(input);
  const data = await apiResponse(await fetch("/api/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalized),
  }));
  return data.item;
}
