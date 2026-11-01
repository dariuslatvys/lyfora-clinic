import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  formatChatWhen,
  getChatThread,
} from "@/lib/health/demo-consultations";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const thread = getChatThread(id);
  if (!thread) notFound();

  const title = locale === "en" ? thread.titleEn : thread.titleLt;
  const doctor = locale === "en" ? thread.doctorEn : thread.doctorLt;
  const specialty =
    locale === "en" ? thread.specialtyEn : thread.specialtyLt;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <Link href="/patient/consultations" className="text-sm text-[var(--muted)]">
        ← {labels.consultations}
      </Link>

      <section className="panel">
        <span className="eyebrow">
          {locale === "en" ? "Online chat" : "Online pokalbis"}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-[1.45rem] font-bold mt-1 mb-0">
          {title}
        </h1>
        <p className="mt-2 mb-0 text-sm text-[var(--ink-soft)]">
          {doctor} · {specialty}
        </p>
        <p className="small muted m-0 mt-1">
          {locale === "en" ? "Last message" : "Paskutinė žinutė"}:{" "}
          {formatChatWhen(thread.lastAt, locale)}
        </p>
      </section>

      <section className="card chat-thread">
        <div className="chat-msgs">
          {thread.messages.map((m) => {
            const mine = m.from === "patient";
            const text = locale === "en" ? m.textEn : m.textLt;
            return (
              <div
                key={m.id}
                className={`chat-bubble ${mine ? "mine" : "theirs"}`}
              >
                <p className="chat-bubble-meta m-0">
                  {mine
                    ? locale === "en"
                      ? "You"
                      : "Jūs"
                    : doctor}{" "}
                  · {formatChatWhen(m.at, locale)}
                </p>
                <p className="chat-bubble-text m-0">{text}</p>
              </div>
            );
          })}
        </div>

        <div className="chat-compose mt-4">
          <label className="eyebrow" htmlFor="reply">
            {locale === "en" ? "Reply" : "Atsakyti"}
          </label>
          <textarea
            id="reply"
            rows={3}
            className="mt-2 w-full rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            placeholder={
              locale === "en"
                ? "Write a follow-up message…"
                : "Parašykite papildomą žinutę…"
            }
            disabled
          />
          <p className="small muted mt-2 mb-0">
            {locale === "en"
              ? "Demo mode — sending is disabled."
              : "Demo režimas — siuntimas išjungtas."}
          </p>
        </div>
      </section>

      <div className="row" style={{ gap: 8 }}>
        <Link href="/patient/consultations" className="btn ghost">
          {labels.consultations}
        </Link>
        <Link href="/patient/questions" className="btn">
          {labels.askDoctor247}
        </Link>
      </div>
    </div>
  );
}
