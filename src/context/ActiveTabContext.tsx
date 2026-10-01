"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ActiveTabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ActiveTabContext = createContext<ActiveTabContextType>({
  activeTab: "",
  setActiveTab: () => {},
});

export function ActiveTabProvider({
  children,
  defaultTab = "",
}: {
  children: React.ReactNode;
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export function useActiveTab() {
  return useContext(ActiveTabContext);
}

/**
 * RouteTab component: Each route wraps its content in <RouteTab tab="...">
 * to explicitly declare its active tab for the sidebar.
 */
export function RouteTab({
  tab,
  children,
}: {
  tab: string;
  children: React.ReactNode;
}) {
  const { setActiveTab } = useActiveTab();

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab, setActiveTab]);

  return <>{children}</>;
}
