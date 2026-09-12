import { ShoppingCart, Apple, UtensilsCrossed, User, Settings } from "lucide-react";
import { useState } from "react";
import { ProfileMenu } from "./ProfileMenu";
import type { Tenant } from "@/lib/store";

export type NavTab = "shopping" | "nutrition" | "meals" | "personal";

type Props = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  tenants: Tenant[];
  activeTenantId: string;
  hiddenTenantIds: string[];
  onSelectTenant: (id: string) => void;
  onAddTenant: (name: string) => void;
  onRenameTenant: (id: string, name: string) => void;
  onDeleteTenant: (id: string) => void;
  onToggleHiddenTenant: (id: string) => void;
};

export function BottomNavigation({
  activeTab,
  onTabChange,
  onSignOut,
  onDeleteAccount,
  tenants,
  activeTenantId,
  hiddenTenantIds,
  onSelectTenant,
  onAddTenant,
  onRenameTenant,
  onDeleteTenant,
  onToggleHiddenTenant,
}: Props) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const tabs: Array<{ id: NavTab; label: string; icon: typeof ShoppingCart }> =
    [
      { id: "shopping", label: "Alışveriş", icon: ShoppingCart },
      { id: "nutrition", label: "Besin Değerleri", icon: Apple },
      { id: "meals", label: "Yemek Planı", icon: UtensilsCrossed },
      { id: "personal", label: "Kişisel Plan", icon: User },
    ];

  return (
    <>
      {/* Profile Menu Modal */}
      <ProfileMenu
        isOpen={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        onSignOut={onSignOut}
        onDeleteAccount={onDeleteAccount}
        tenants={tenants}
        activeTenantId={activeTenantId}
        hiddenTenantIds={hiddenTenantIds}
        currentUserId={null}
        onSelectTenant={onSelectTenant}
        onAddTenant={onAddTenant}
        onRenameTenant={onRenameTenant}
        onDeleteTenant={onDeleteTenant}
        onToggleHiddenTenant={onToggleHiddenTenant}
      />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card shadow-lg">
        <div className="flex items-center justify-between px-2 py-3">
          {/* Regular Tabs */}
          <div className="flex flex-1 justify-around">
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
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Profile Button */}
          <div className="border-l border-border pl-2">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                profileMenuOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Ayarlar">
              <Settings className="size-5" />
              <span className="hidden sm:inline">Ayarlar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20 sm:h-16" />
    </>
  );
}
