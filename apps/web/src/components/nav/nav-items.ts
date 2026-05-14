export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sources", href: "/sources" },
  { label: "Documents", href: "/documents" },
  { label: "Ask Assistant", href: "/ask" },
  { label: "Architecture", href: "/architecture" },
  { label: "Ask Sessions", href: "/ask-sessions" }
];
