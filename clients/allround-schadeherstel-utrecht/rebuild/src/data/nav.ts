export interface NavItem {
  label: string;
  href: string;
}

/** Primary in-page navigation (anchors to sections). */
export const navItems: NavItem[] = [
  { label: "Diensten", href: "#diensten" },
  { label: "Voertuigen", href: "#voertuigen" },
  { label: "Zakelijk", href: "#zakelijk" },
  { label: "Werkwijze", href: "#werkwijze" },
  { label: "Contact", href: "#contact" },
];
