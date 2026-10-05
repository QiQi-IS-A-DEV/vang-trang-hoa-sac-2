import type { MessageInput } from "@/types";

export const messageLimits = { author: 80, team: 80, message: 1000 } as const;
export function validateMessage(input: MessageInput): string | null {
  if (!input.author_name.trim() || Array.from(input.author_name.trim()).length > messageLimits.author) return "Tên cần có từ 1 đến 80 ký tự.";
  if (input.role_team !== null && (!input.role_team.trim() || Array.from(input.role_team.trim()).length > messageLimits.team)) return "Ban/đội tối đa 80 ký tự.";
  if (!input.message.trim() || Array.from(input.message.trim()).length > messageLimits.message) return "Lời nhắn cần có từ 1 đến 1.000 ký tự.";
  if (!["lantern", "star"].includes(input.leaf_type)) return "Hãy chọn lồng đèn hoặc ngôi sao.";
  return null;
}

export function parseMessage(value: unknown): MessageInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dữ liệu lời nhắn không hợp lệ.");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["author_name", "role_team", "message", "leaf_type"].includes(key))) throw new Error("Dữ liệu có trường không được phép.");
  if (typeof data.author_name !== "string" || typeof data.message !== "string" || typeof data.leaf_type !== "string" || (data.role_team !== undefined && data.role_team !== null && typeof data.role_team !== "string")) throw new Error("Dữ liệu lời nhắn không hợp lệ.");
  const input: MessageInput = {
    author_name: data.author_name.trim(), message: data.message.trim(),
    role_team: typeof data.role_team === "string" ? data.role_team.trim() || null : null,
    leaf_type: data.leaf_type as MessageInput["leaf_type"],
  };
  const error = validateMessage(input);
  if (error) throw new Error(error);
  return input;
}
