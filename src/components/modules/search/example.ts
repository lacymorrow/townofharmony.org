import { routes } from "@/config/routes";
import type { MainNavItem, SidebarNavItem } from "@/types/nav";

export interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
  featuresNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: routes.docs,
    },
    {
      title: "Contact",
      href: routes.contact,
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: routes.docs,
          items: [],
        },
        {
          title: "Installation",
          href: `${routes.docs}/installation`,
          items: [],
        },
        {
          title: "Quick Start",
          href: `${routes.docs}/quick-start`,
          items: [],
        },
        {
          title: "Deployment",
          href: `${routes.docs}/deployment`,
          items: [],
        },
        {
          title: "Environment Variables",
          href: `${routes.docs}/env`,
          items: [],
        },
        {
          title: "Authentication",
          href: `${routes.docs}/auth`,
          items: [],
        },
        {
          title: "Integrations",
          href: `${routes.docs}/integrations`,
          items: [],
          label: "Updated",
        },
        {
          title: "Changelog",
          href: `${routes.docs}/changelog`,
          items: [],
        },
      ],
    },
  ],
  featuresNav: [
    {
      title: "Core Features",
      items: [
        {
          title: "Authentication",
          href: routes.auth.signIn,
          items: [],
        },
        {
          title: "Dashboard",
          href: routes.app.dashboard,
          items: [],
        },
        {
          title: "Settings",
          href: routes.settings.index,
          items: [],
        },
      ],
    },
  ],
};
