"use client";

import { useState } from "react";
import { Avatar, Btn, Card, Pill, ScoreRing, Segmented } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useOverlays } from "@/components/overlays";
import { useToast } from "@/components/toast";
import { PageIntro } from "@/components/page-intro";
import { getClients } from "@/lib/mock-data";
import type { Client, ClientTag } from "@/lib/types";

const PALETTE = ["#3E5C76", "#5B8266", "#A6794C", "#7A5C8E", "#B45309", "#2F6F6A"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.map((p) => p[0]).slice(0, 2).join("") || "?").toUpperCase();
}

export default function ClientsPage() {
  const { openClient } = useOverlays();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "attention" | "repeat">("all");
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [adding, setAdding] = useState(false);

  const filtered = clients.filter((c) => {
    const m = c.name.toLowerCase().includes(q.toLowerCase());
    const f =
      filter === "all" ||
      (filter === "attention" && (c.tag === "At risk" || c.tag === "Overdue")) ||
      (filter === "repeat" && (c.tag === "Repeat" || c.tag === "Package"));
    return m && f;
  });

  function addClient(data: { name: string; email: string; phone: string; tag: ClientTag; note: string }) {
    const now = new Date();
    const client: Client = {
      id: "cl_" + now.getTime(),
      name: data.name.trim(),
      initials: initialsOf(data.name),
      email: data.email.trim(),
      phone: data.phone.trim(),
      tag: data.tag,
      since: now.toISOString().slice(0, 7),
      sessions: 0,
      cancellations: 0,
      noShows: 0,
      balance: 0,
      depositHeld: 0,
      lastSeen: "Just added",
      nextLabel: "—",
      avgScore: 60,
      lifetime: 0,
      color: PALETTE[clients.length % PALETTE.length],
      prefs: [],
      notes: data.note.trim() ? [{ d: "Today", t: data.note.trim() }] : [],
      reviews: [],
      payments: [],
    };
    setClients((prev) => [client, ...prev]);
    setAdding(false);
    toast(`Added ${client.name}`);
  }

  return (
    <div className="space-y-5">
      <PageIntro id="clients" tag="Clients" title="Your people, remembered" body="Every client's history, notes, reviews, and payments live in one place. Open anyone to see the full picture before a session, so you always walk in prepared." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted">{clients.length} people · relationship memory, history, reviews and payments in one place</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => toast("Contact import is coming soon")}>Import contacts</Btn>
          <Btn onClick={() => setAdding(true)}><Icon.plus className="w-4 h-4" />Add client</Btn>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="inp flex-1 min-w-[200px]" />
        <Segmented<"all" | "attention" | "repeat"> value={filter} onChange={setFilter} size="sm" options={[{ value: "all", label: "All" }, { value: "attention", label: "Needs attention" }, { value: "repeat", label: "Repeat" }]} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => openClient(c)} className="text-left">
            <Card className="!p-4 hover:border-[#d8d8d2] h-full">
              <div className="flex items-start gap-3">
                <Avatar initials={c.initials} color={c.color} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{c.name}</span>
                    <Pill tone={c.tag === "At risk" || c.tag === "Overdue" ? "bad" : c.tag === "New lead" ? "info" : "good"}>{c.tag}</Pill>
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">{c.sessions} sessions · ${c.lifetime.toLocaleString()} lifetime · since {c.since}</div>
                  <div className="text-[12px] text-muted mt-1">{c.nextLabel !== "—" ? <span>Next: <b className="text-ink/80">{c.nextLabel}</b></span> : <span>Last seen {c.lastSeen}</span>}</div>
                </div>
                <ScoreRing score={c.avgScore} size={38} />
              </div>
              {c.balance > 0 && <div className="mt-3 pt-3 border-t border-line"><Pill tone="bad">${c.balance} outstanding</Pill></div>}
            </Card>
          </button>
        ))}
      </div>

      {adding && <AddClientModal onClose={() => setAdding(false)} onSave={addClient} />}
    </div>
  );
}

function AddClientModal({ onClose, onSave }: { onClose: () => void; onSave: (d: { name: string; email: string; phone: string; tag: ClientTag; note: string }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tag, setTag] = useState<ClientTag>("New lead");
  const [note, setNote] = useState("");
  const valid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[66] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[16px] shadow-2xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-[#F2F2EF] flex items-center justify-center text-faint hover:text-ink">
          <Icon.x className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">Add client</h2>
        <p className="text-[13px] text-muted mt-0.5">They will appear in your client list right away.</p>

        <div className="space-y-3 mt-4">
          <div>
            <label className="text-[12px] font-semibold text-faint uppercase block mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" autoFocus className="inp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-faint uppercase block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@email.com" className="inp" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-faint uppercase block mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0199" className="inp" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-faint uppercase block mb-1.5">Tag</label>
            <select value={tag} onChange={(e) => setTag(e.target.value as ClientTag)} className="inp">
              <option value="New lead">New lead</option>
              <option value="Repeat">Repeat</option>
              <option value="Package">Package</option>
              <option value="At risk">At risk</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-faint uppercase block mb-1">First note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="How you met, what they want to work on…" className="inp !text-[13px] resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => valid && onSave({ name, email, phone, tag, note })} className={valid ? "" : "opacity-50 pointer-events-none"}>Add client</Btn>
        </div>
      </div>
    </div>
  );
}
