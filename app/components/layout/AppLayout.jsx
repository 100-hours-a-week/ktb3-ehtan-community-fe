import { useCallback, useMemo, useState } from "react";
import "./app-layout.css";

export function AppLayout({ Header, Banner, Sidebar, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleSidebarToggle = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    []
  );

  const headerNode = useMemo(() => {
    if (!Header) return null;
    return (
      <Header
        onToggleSidebar={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
    );
  }, [Header, handleSidebarToggle, sidebarCollapsed]);

  const bannerNode = Banner ? <Banner /> : null;
  const sidebarNode = Sidebar ? <Sidebar collapsed={sidebarCollapsed} /> : null;

  return (
    <div className="app-shell">
      {headerNode}
      {bannerNode}
      <div className="flex">
        {sidebarNode}
        {children}
      </div>
    </div>
  );
}
