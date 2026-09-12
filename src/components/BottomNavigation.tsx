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
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={label}>
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
