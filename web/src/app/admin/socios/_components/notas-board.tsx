"use client";

import { useState } from "react";
import { AtSign, Eye, EyeOff, Heart, Paperclip, Pin, PinOff, Send } from "lucide-react";
import { face } from "@/lib/photos";
import { cn } from "@/lib/utils";
import type { Author, Note, NoteTag } from "../_lib/notes";

type TagMeta = { tag: NoteTag; color: string };

function Face({ i, size }: { i: number; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={face(i, size * 2)} alt="" width={size} height={size} className="shrink-0 rounded-full bg-surface-3 object-cover" style={{ width: size, height: size }} />
  );
}

function Tag({ tag, color, on = true }: { tag: NoteTag; color: string; on?: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold", !on && "text-muted ring-1 ring-inset ring-line hover:text-fg-2")}
      style={
        on
          ? { color, background: `color-mix(in oklab, ${color} 12%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 28%, transparent)` }
          : undefined
      }
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {tag}
    </span>
  );
}

/** Notas del staff: compositor, fijadas y línea de tiempo con filtro por etiqueta. */
export function NotesBoard({ initial, tags, me, member }: { initial: Note[]; tags: TagMeta[]; me: Author; member: string }) {
  const [notes, setNotes] = useState(initial);
  const [filter, setFilter] = useState<NoteTag | "Todas">("Todas");
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<NoteTag[]>(["Entrenamiento"]);
  const [visible, setVisible] = useState(false);
  const [pinNew, setPinNew] = useState(false);
  const color = Object.fromEntries(tags.map((t) => [t.tag, t.color])) as Record<NoteTag, string>;

  const publish = () => {
    if (!text.trim()) return;
    const n: Note = {
      id: `n-${notes.length + 1}-${text.length}`,
      author: me,
      body: text.trim(),
      tags: picked.length ? picked : ["Administrativo"],
      when: "Ahora",
      date: "25 nov",
      month: "Noviembre",
      pinned: pinNew,
      visibleToMember: visible,
    };
    setNotes([n, ...notes]);
    setText("");
    setPinNew(false);
  };
  const togglePin = (id: string) => setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  const toggleTag = (t: NoteTag) => setPicked(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t]);

  const shown = notes.filter((n) => filter === "Todas" || n.tags.includes(filter));
  const pinned = shown.filter((n) => n.pinned);
  const rest = shown.filter((n) => !n.pinned);
  const months = [...new Set(rest.map((n) => n.month))];
  const counts = Object.fromEntries(tags.map((t) => [t.tag, notes.filter((n) => n.tags.includes(t.tag)).length]));

  return (
    <div className="grid gap-4">
      {/* Compositor */}
      <section className="panel stagger p-4 sm:p-5" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="flex gap-3">
          <span className="hidden sm:block">
            <Face i={me.face} size={36} />
          </span>
          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) publish();
              }}
              rows={3}
              placeholder={`Escribí una nota sobre ${member}… (usá @ para mencionar al equipo)`}
              className="w-full resize-none rounded-xl border border-line bg-ink/50 px-3.5 py-3 text-[13.5px] leading-relaxed text-fg outline-none transition placeholder:text-faint focus:border-lime/40 focus:bg-ink/70"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {tags.map((t) => {
                const on = picked.includes(t.tag);
                return (
                  <button
                    key={t.tag}
                    onClick={() => toggleTag(t.tag)}
                    aria-pressed={on}
                    className="rounded-full py-0.5 transition active:scale-95"
                  >
                    <Tag tag={t.tag} color={on ? t.color : "var(--color-faint)"} on={on} />
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div className="flex items-center gap-1">
                <button className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg" aria-label="Mencionar">
                  <AtSign className="size-4" />
                </button>
                <button className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg" aria-label="Adjuntar">
                  <Paperclip className="size-4" />
                </button>
                <button
                  onClick={() => setPinNew(!pinNew)}
                  aria-pressed={pinNew}
                  className={cn("flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold transition", pinNew ? "bg-amber/12 text-amber" : "text-muted hover:bg-white/5 hover:text-fg")}
                >
                  <Pin className="size-3.5" /> Fijar
                </button>
                <button
                  onClick={() => setVisible(!visible)}
                  aria-pressed={visible}
                  className={cn("flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold transition", visible ? "bg-cyan/12 text-cyan" : "text-muted hover:bg-white/5 hover:text-fg")}
                >
                  {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  <span className="hidden sm:inline">{visible ? "Visible en su app" : "Solo staff"}</span>
                </button>
              </div>
              <button
                onClick={publish}
                disabled={!text.trim()}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-lime px-4 text-[13px] font-bold text-lime-ink shadow-[0_8px_30px_-8px_rgb(181_245_74/0.55)] transition hover:bg-[#c4fa66] active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="size-3.5" /> Publicar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filtro */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["Todas", ...tags.map((t) => t.tag)] as const).map((t) => {
          const on = filter === t;
          const n = t === "Todas" ? notes.length : counts[t];
          if (t !== "Todas" && !n) return null;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition",
                on ? "bg-fg text-ink" : "bg-white/[0.04] text-fg-2 ring-1 ring-inset ring-line hover:bg-white/[0.07]",
              )}
            >
              {t !== "Todas" && <span className="size-1.5 rounded-full" style={{ background: color[t] }} />}
              {t}
              <span className={cn("tabular", on ? "text-ink/60" : "text-faint")}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Fijadas */}
      {pinned.length > 0 && (
        <section>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber">
            <Pin className="size-3.5" /> Fijadas · {pinned.length}
          </p>
          <div className={cn("grid gap-3", pinned.length > 1 && "md:grid-cols-2")}>
            {pinned.map((n, k) => (
              <article
                key={n.id}
                className="stagger relative flex flex-col overflow-hidden rounded-2xl border border-amber/25 p-4 shadow-[var(--shadow-card)]"
                style={{ "--i": k + 3, background: "linear-gradient(160deg, rgb(255 190 85 / 0.09), transparent 55%), var(--color-surface)" } as React.CSSProperties}
              >
                <NoteHead n={n} onPin={() => togglePin(n.id)} />
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-fg-2">{n.body}</p>
                <NoteFoot n={n} color={color} />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Línea de tiempo */}
      <section className="panel stagger p-5 sm:p-6" style={{ "--i": 5 } as React.CSSProperties}>
        {months.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No hay más notas con esta etiqueta.</p>}
        {months.map((mo) => (
          <div key={mo} className="mb-6 last:mb-0">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{mo} 2026</p>
              <span className="h-px flex-1 bg-line" />
            </div>
            <ol className="relative">
              <span className="absolute bottom-3 left-[17px] top-3 w-px bg-line-strong" />
              {rest
                .filter((n) => n.month === mo)
                .map((n) => (
                  <li key={n.id} className="group relative flex gap-3.5 pb-5 last:pb-0">
                    <span className="relative z-[1] rounded-full ring-4 ring-surface">
                      <Face i={n.author.face} size={35} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <NoteHead n={n} onPin={() => togglePin(n.id)} compact />
                      <div className="mt-2 rounded-xl rounded-tl-sm border border-line bg-white/[0.025] px-3.5 py-3 transition group-hover:border-line-strong">
                        <p className="text-[13px] leading-relaxed text-fg-2">{n.body}</p>
                        <NoteFoot n={n} color={color} />
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}

function NoteHead({ n, onPin, compact }: { n: Note; onPin: () => void; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {!compact && <Face i={n.author.face} size={30} />}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[13px] font-bold text-fg">
          {n.author.name} <span className="font-semibold text-muted">· {n.author.role}</span>
        </p>
        <p className="text-[11.5px] font-semibold text-faint tabular">{n.when}</p>
      </div>
      <button
        onClick={onPin}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg transition",
          n.pinned ? "text-amber hover:bg-amber/10" : "text-faint opacity-100 hover:bg-white/5 hover:text-fg sm:opacity-0 sm:group-hover:opacity-100",
        )}
        aria-label={n.pinned ? "Desfijar nota" : "Fijar nota"}
      >
        {n.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>
    </div>
  );
}

function NoteFoot({ n, color }: { n: Note; color: Record<NoteTag, string> }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {n.tags.map((t) => (
        <Tag key={t} tag={t} color={color[t]} />
      ))}
      <span className="ml-auto flex items-center gap-3 text-[11px] font-semibold text-faint">
        {n.visibleToMember && (
          <span className="flex items-center gap-1 text-cyan/80">
            <Eye className="size-3.5" /> En su app
          </span>
        )}
        {n.reactions ? (
          <span className="flex items-center gap-1 text-rose/80">
            <Heart className="size-3.5 fill-current" /> {n.reactions}
          </span>
        ) : null}
      </span>
    </div>
  );
}
