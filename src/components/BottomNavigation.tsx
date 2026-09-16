import { ShoppingCart, Apple, UtensilsCrossed, User, Settings } from "lucide-react";

export type NavTab = "shopping" | "nutrition" | "meals" | "personal" | "settings";

type Props = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
};

export function BottomNavigation({ activeTab, onTabChange }: Props) {
  const tabs: Array<{ id: NavTab; label: string; icon: typeof ShoppingCart }> =
    [
      { id: "shopping", label: "Alışveriş", icon: ShoppingCart },
      { id: "nutrition", label: "Besin Değerleri", icon: Apple },
      { id: "meals", label: "Yemek Planı", icon: UtensilsCrossed },
      { id: "personal", label: "Kişisel Plan", icon: User },
      { id: "settings", label: "Ayarlar", icon: Settings },
    ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card shadow-lg">
        <div className="flex items-center justify-around gap-1 px-2 py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`sp-trigger flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                activeTab === id
                  ? "bg-signal/10 text-signal"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-active={activeTab === id}
              aria-label={label}
              aria-current={activeTab === id ? "page" : undefined}>
              <Icon className="size-5" />
              <span className="text-[10px] leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20 sm:h-16" />
    </>
  );
}
