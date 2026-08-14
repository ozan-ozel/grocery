import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { relativeDay, type List } from "@/lib/store";

type Props = {
  lists: List[];
  onReuse: (listId: string) => void;
};

export function HistoryView({ lists, onReuse }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (lists.length === 0) {
    return (
      <p className="px-1 py-10 text-sm text-muted-foreground">
        Henüz tamamlanmış bir liste yok. Yeni liste başlattığında eskisi
        buraya arşivlenir ve tekrar kullanılmaya hazır olur.
      </p>
    );
  }

  return (
    <ul>
      {lists.map((list) => {
        const open = openId === list.id;
        const bought = list.items.filter((i) => i.checked).length;
        return (
          <li key={list.id} className="border-b border-border">
            <div className="flex items-center gap-2 py-3.5">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : list.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
                <span className="flex-1">
                  <span className="block text-[0.975rem]">{list.title}</span>
                  <span className="ledger text-xs text-muted-foreground">
                    {relativeDay(list.closedAt ?? list.createdAt)}
                  </span>
                </span>
                <span className="ledger text-sm text-muted-foreground">
                  {bought}/{list.items.length}
                </span>
              </button>

              <Button
                variant="quiet"
                size="sm"
                onClick={() => onReuse(list.id)}
                title="Bu ürünleri güncel listeye kopyala"
              >
                <RotateCcw className="size-3.5" />
                Tekrar kullan
              </Button>
            </div>

            {open && (
              <ul className="pb-3 pl-6">
                {list.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between py-1 text-sm text-muted-foreground"
                  >
                    <span>{item.name}</span>
                    {item.qty && <span className="ledger text-xs">{item.qty}</span>}
                  </li>
                ))}
                {list.items.length === 0 && (
                  <li className="py-1 text-sm text-muted-foreground">
                    Bu liste boş kapatıldı.
                  </li>
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
