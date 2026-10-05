"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/frontend/lib/supabase/client";
import { fetchMessages, mergeMessages, submitMessage } from "@/frontend/lib/memories/messages";
import type { LeafType, MemoryMessage } from "@/shared/types";
import { MemoryTree } from "./memory-tree";

const symbols: Record<LeafType, string> = { leaf: "🏮", lantern: "🏮", star: "⭐" };
const inputClass = "mt-2 w-full rounded-xl border border-pink-200/30 bg-purple-950/60 px-4 py-3 text-white focus:outline-2 focus:outline-amber-200";

const sampleMessages: MemoryMessage[] = [
  {
    id: "sample-1",
    author_name: "Ban Tổ Chức",
    role_team: "Điều phối chiến dịch",
    message: "Chúc các em thiếu nhi có một mùa trăng rằm ấm áp, ngập tràn tiếng cười và tình yêu thương!",
    leaf_type: "lantern",
    slot_index: 1,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "sample-2",
    author_name: "Ban Hậu Cần",
    role_team: "Hậu cần & Kỹ thuật",
    message: "Hơn 500 chiếc lồng đèn tự tay vót tre, dán giấy kiếng đỏ gửi trọn niềm tin yêu đến các em.",
    leaf_type: "star",
    slot_index: 3,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "sample-3",
    author_name: "Ban Truyền Thông",
    role_team: "Truyền thông & Báo chí",
    message: "Ánh mắt lấp lánh của các em nhỏ khi nhận quà là khung hình đẹp nhất của mùa trăng này.",
    leaf_type: "lantern",
    slot_index: 7,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "sample-4",
    author_name: "Chiến sĩ tình nguyện",
    role_team: "Ban Chương Trình",
    message: "Mệt nhưng vui vô cùng! Biết ơn vì được là một phần của Vầng Trăng Hòa Sắc 2.",
    leaf_type: "star",
    slot_index: 12,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "sample-5",
    author_name: "Vầng Trăng Yêu Thương",
    role_team: "Hội Sinh Viên",
    message: "Gửi ngàn lời chúc bình an và may mắn đến toàn thể các bạn chiến sĩ và các em thiếu nhi!",
    leaf_type: "lantern",
    slot_index: 18,
    created_at: new Date().toISOString(),
  },
];

export interface MessageBoardProps {
  allowSubmissions?: boolean;
}

export function MessageBoard({ allowSubmissions = true }: MessageBoardProps) {
  const configured = isSupabaseConfigured();
  const [messages, setMessages] = useState<MemoryMessage[]>(configured ? [] : sampleMessages);
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [sending, setSending] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (!configured) return;
    const client = createSupabaseBrowserClient();
    let active = true;
    let syncing = false;
    let resync = false;
    async function sync() {
      if (syncing) { resync = true; return; }
      syncing = true;
      try {
        const data = await fetchMessages();
        if (active) {
          setMessages((current) => mergeMessages(current, data));
          setLoadError("");
        }
      } catch (error) {
        const missingTable = typeof error === "object" && error !== null && "code" in error && error.code === "PGRST205";
        if (active) setLoadError(missingTable ? "Không gian lời nhắn chưa sẵn sàng. Vui lòng quay lại sau." : "Chưa tải được lời nhắn. Vui lòng thử tải lại.");
      } finally {
        syncing = false;
        if (active) {
          setLoading(false);
          if (resync) { resync = false; void sync(); }
        }
      }
    }
    const channel = client.channel("memory-messages", { config: { postgres_changes_options: { wait: true } } })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (event) => {
        if (active) setMessages((current) => mergeMessages(current, [event.new as MemoryMessage]));
      })
      .subscribe((status) => {
        if (!active) return;
        setConnected(status === "SUBSCRIBED");
        // Fetch again once listening, and after each reconnection.
        if (status === "SUBSCRIBED") void sync();
      });
    void sync();
    const onFocus = () => { void sync(); };
    window.addEventListener("focus", onFocus);
    // Also reconcile if realtime is temporarily unavailable.
    const timer = window.setInterval(onFocus, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      void client.removeChannel(channel);
    };
  }, [configured]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || loading || loadError || submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true;
    setSending(true);
    setFormNotice("");
    try {
      const saved = await submitMessage({
        author_name: String(data.get("author_name") ?? ""),
        role_team: String(data.get("role_team") ?? "") || null,
        message: String(data.get("message") ?? ""),
        leaf_type: String(data.get("leaf_type") ?? "lantern") as LeafType,
      });
      setMessages((current) => mergeMessages(current, [saved]));
      form.reset();
      setFormNotice("Đã gửi lời nhắn của bạn!");
    } catch (error) {
      const validation = error instanceof Error ? error.message : "";
      setFormNotice(validation || "Chưa xác nhận được lời nhắn đã lưu. Kiểm tra danh sách trước khi gửi lại.");
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  return (
    <>
      <MemoryTree messages={messages} />
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form id="leave-message" onSubmit={onSubmit} className="rounded-3xl border border-pink-200/30 bg-purple-950/65 backdrop-blur-md p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-amber-100">Gửi một lời nhắn</h2>
        {!allowSubmissions ? (
          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5 text-center text-amber-100">
            <p className="text-2xl mb-2">🏮</p>
            <h3 className="font-bold text-base text-amber-200">Cổng gửi lời nhắn hiện đang tạm đóng</h3>
            <p className="mt-2 text-xs leading-relaxed text-purple-200/90">
              Ban Tổ Chức đã tạm khép lại hòm thư mùa trăng để lưu giữ trọn vẹn những kỷ niệm đẹp. Mời bạn ngắm nhìn Cây Kỷ Niệm và đọc lại những điều thương mến bên cạnh nhé!
            </p>
          </div>
        ) : (
          <>
            {!configured && <p className="mt-4 rounded-xl bg-amber-100/10 p-4 text-sm leading-6 text-amber-100">Không gian lời nhắn đang được chuẩn bị. Bạn sẽ có thể gửi khi kết nối hoàn tất.</p>}
            <fieldset disabled={!configured || loading || Boolean(loadError) || sending} className="mt-6 space-y-5 disabled:opacity-60">
              <label className="block">Tên của bạn<input name="author_name" autoComplete="name" required maxLength={80} className={inputClass} /></label>
              <label className="block">Ban Chuyên Môn <span className="text-sm text-purple-200">(không bắt buộc)</span><input name="role_team" maxLength={80} className={inputClass} /></label>
              <label className="block">Bạn muốn để lại điều gì?<textarea name="message" required maxLength={1000} rows={5} className={inputClass} /><span className="text-xs text-purple-200">Tối đa 1.000 ký tự</span></label>
              <label className="block">Chọn biểu tượng<select name="leaf_type" defaultValue="lantern" className={inputClass}><option value="lantern">🏮 Lồng đèn</option><option value="star">⭐ Ngôi sao</option></select></label>
              <button type="submit" className="festival-button w-full rounded-full px-6 py-3 font-bold text-purple-950 disabled:opacity-60">{sending ? "Đang gửi…" : "Gửi lời nhắn"}</button>
            </fieldset>
            <p role="status" className="mt-4 text-sm text-amber-100">{formNotice}</p>
          </>
        )}
      </form>
      <section aria-labelledby="messages-heading" className="rounded-3xl border border-pink-200/30 bg-purple-950/65 backdrop-blur-md p-6 md:p-8">
        <h2 id="messages-heading" className="text-2xl font-semibold text-amber-100">Lời nhắn của chúng ta</h2>
        {configured && <p className="mt-2 text-sm text-purple-200" role="status">{loadError ? "Chưa kết nối được dữ liệu lời nhắn" : connected ? "Đang nhận lời nhắn mới" : "Đang kết nối · tự tải lại định kỳ"}</p>}
        {loadError && <p role="alert" className="mt-4 text-amber-200">{loadError} <button onClick={() => window.location.reload()} className="underline">Tải lại</button></p>}
        {loading ? <p className="mt-6 text-purple-100">Đang tải lời nhắn…</p> : !messages.length && <p className="mt-6 leading-7 text-purple-100">{configured ? "Chưa có lời nhắn. Hãy để lại kỷ niệm đầu tiên!" : "Những kỷ niệm của chúng ta sẽ xuất hiện tại đây."}</p>}
        <ul className="mt-6 max-h-[650px] space-y-4 overflow-y-auto">
          {messages.map((item) => <li key={item.id} className="rounded-2xl bg-purple-950/50 p-5">
            <p className="break-words font-semibold text-amber-100"><span aria-hidden="true">{symbols[item.leaf_type]}</span> {item.author_name}</p>
            {item.role_team && <p className="mt-1 break-words text-sm text-purple-200">{item.role_team}</p>}
            <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-white">{item.message}</p>
            <time dateTime={item.created_at} className="mt-3 block text-xs text-purple-200">{new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(item.created_at))}</time>
          </li>)}
        </ul>
      </section>
    </div>
    </>
  );
}
