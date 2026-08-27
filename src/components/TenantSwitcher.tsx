import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, Plus, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/lib/store";
import { inviteToHousehold, listHouseholdShares, revokeHouseholdShare } from "@/lib/householdShares";

type Props = {
  tenants: Tenant[];
  activeId: string;
  hiddenIds: string[];
  currentUserId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
};

export function TenantSwitcher({
  tenants,
  activeId,
  hiddenIds,
  currentUserId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onToggleHidden,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const [managingSharesId, setManagingSharesId] = useState<string | null>(null);
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [shareDraft, setShareDraft] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  // Email currently armed for removal — tapping ✕ once shows a confirm/
  // cancel pair instead of revoking immediately.
  const [confirmingRevokeEmail, setConfirmingRevokeEmail] = useState<string | null>(null);

  const active = tenants.find((t) => t.id === activeId) ?? tenants[0];

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setDraft("");
        setEditingId(null);
        setManagingSharesId(null);
        setConfirmingRevokeEmail(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setAdding(false);
        setEditingId(null);
        setManagingSharesId(null);
        setConfirmingRevokeEmail(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Enter fires commitAdd and then blurs the input, which fires commitAdd
  // again via onBlur. Without this guard the same name posts twice and we
  // end up with two households. Same for rename.
  const submittingAdd = useRef(false);
  const submittingRename = useRef(false);

  function commitAdd() {
    if (submittingAdd.current) return;
    submittingAdd.current = true;
    const name = draft.trim();
    if (!name) {
      setAdding(false);
      setDraft("");
      submittingAdd.current = false;
      return;
    }
    onAdd(name);
    setDraft("");
    setAdding(false);
    // Reset after the current tick so the trailing blur is swallowed.
    setTimeout(() => (submittingAdd.current = false), 0);
  }

  function commitRename(id: string) {
    if (submittingRename.current) return;
    submittingRename.current = true;
    const name = editDraft.trim();
    if (name) onRename(id, name);
    setEditingId(null);
    setEditDraft("");
    setTimeout(() => (submittingRename.current = false), 0);
  }

  const submittingShare = useRef(false);

  async function openShares(id: string) {
    setConfirmingRevokeEmail(null);
    if (managingSharesId === id) {
      setManagingSharesId(null);
      return;
    }
    setManagingSharesId(id);
    setShareDraft("");
    setShareLoading(true);
    const emails = await listHouseholdShares(id);
    setShareLoading(false);
    setShareEmails(emails);
  }

  async function commitInvite(householdId: string) {
    if (submittingShare.current) return;
    const email = shareDraft.trim();
    if (!email) return;
    submittingShare.current = true;
    const ok = await inviteToHousehold(householdId, email);
    if (ok) {
      const normalized = email.toLowerCase();
      setShareEmails((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
      setShareDraft("");
    }
    submittingShare.current = false;
  }

  async function removeShare(householdId: string, email: string) {
    setConfirmingRevokeEmail(null);
    const ok = await revokeHouseholdShare(householdId, email);
    if (ok) setShareEmails((prev) => prev.filter((e) => e !== email));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Ev seç"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ledger flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="max-w-[10ch] truncate">{active?.name ?? "Ev"}</span>
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 origin-top-left overflow-hidden rounded-md border border-border bg-card shadow-lg transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          <ul className="max-h-64 overflow-y-auto py-1">
            {tenants.map((t) => {
              const isActive = t.id === activeId;
              const isEditing = editingId === t.id;
              const isHidden = hiddenIds.includes(t.id);
              const visibleCount = tenants.length - hiddenIds.length;
              // Refuse to let the user hide the last visible household.
              const canHide = isHidden || visibleCount > 1;
              return (
                <li key={t.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        autoFocus
                        value={editDraft}
                        onInput={(e: Event) =>
                          setEditDraft((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === "Enter") commitRename(t.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => commitRename(t.id)}
                        className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-foreground"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 text-sm",
                        isActive ? "bg-accent" : "hover:bg-accent"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(t.id);
                          setOpen(false);
                        }}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <Check
                          className={cn(
                            "size-3.5",
                            isActive ? "text-foreground" : "text-transparent"
                          )}
                        />
                        <span className={cn("truncate", isHidden && "text-muted-foreground")}>{t.name}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={isHidden ? `${t.name} göster` : `${t.name} gizle`}
                        disabled={!canHide}
                        onClick={() => onToggleHidden(t.id)}
                        className="rounded p-1 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
                      >
                        {isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        aria-label={`${t.name} yeniden adlandır`}
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft(t.name);
                        }}
                        className="rounded p-1 text-muted-foreground transition hover:text-foreground [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {currentUserId != null && t.ownerId === currentUserId && (
                        <button
                          type="button"
                          aria-label={`${t.name} paylaşımını yönet`}
                          onClick={() => openShares(t.id)}
                          className={cn(
                            "rounded p-1 text-muted-foreground transition hover:text-foreground [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100",
                            managingSharesId === t.id
                              ? "text-foreground"
                              : "[@media(pointer:fine)]:opacity-0"
                          )}
                        >
                          <UserPlus className="size-3.5" />
                        </button>
                      )}
                      {tenants.length > 1 && currentUserId != null && t.ownerId === currentUserId && (
                        <button
                          type="button"
                          aria-label={`${t.name} sil`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `"${t.name}" evini ve tüm listelerini silmek istediğine emin misin?`
                              )
                            ) {
                              onDelete(t.id);
                            }
                          }}
                          className="rounded p-1 text-muted-foreground transition hover:text-signal [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {managingSharesId === t.id && (
                    <div className="border-t border-border bg-accent/30 px-3 py-2">
                      <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                        Davetliler
                      </div>
                      {shareLoading ? (
                        <div className="text-xs text-muted-foreground">Yükleniyor…</div>
                      ) : (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {shareEmails.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Henüz kimse davet edilmedi.
                            </span>
                          )}
                          {shareEmails.map((email) =>
                            confirmingRevokeEmail === email ? (
                              <span
                                key={email}
                                className="ledger flex items-center gap-1.5 rounded-full border border-signal/40 bg-background px-2 py-0.5 text-xs"
                              >
                                <span className="text-muted-foreground">Kaldırılsın mı?</span>
                                <button
                                  type="button"
                                  aria-label={`${email} daveti kaldırmayı onayla`}
                                  onClick={() => removeShare(t.id, email)}
                                  className="rounded-full text-signal transition hover:text-signal/80"
                                >
                                  <Check className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Vazgeç"
                                  onClick={() => setConfirmingRevokeEmail(null)}
                                  className="rounded-full text-muted-foreground transition hover:text-foreground"
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            ) : (
                              <span
                                key={email}
                                className="ledger flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                              >
                                {email}
                                <button
                                  type="button"
                                  aria-label={`${email} daveti kaldır`}
                                  onClick={() => setConfirmingRevokeEmail(email)}
                                  className="rounded-full text-muted-foreground transition hover:text-signal"
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            )
                          )}
                        </div>
                      )}
                      <input
                        value={shareDraft}
                        placeholder="email@ornek.com"
                        onInput={(e: Event) =>
                          setShareDraft((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === "Enter") commitInvite(t.id);
                        }}
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-foreground"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="border-t border-border">
            {adding ? (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <input
                  autoFocus
                  value={draft}
                  placeholder="Ev adı"
                  onInput={(e: Event) =>
                    setDraft((e.target as HTMLInputElement).value)
                  }
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") commitAdd();
                    if (e.key === "Escape") {
                      setAdding(false);
                      setDraft("");
                    }
                  }}
                  onBlur={commitAdd}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-foreground"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Yeni ev ekle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
