"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import type { LucideIcon } from "lucide-react";
import { ArrowLeftFromLineIcon, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

const data = [
  {
    title: "Dashboard",
    url: routes.app.dashboard,
    icon: SquareTerminal,
  },
  {
    title: "Management",
    icon: Settings2,
    items: [{ title: "API Keys", url: routes.app.apiKeys }],
  },
];

// Helper function to determine if a route is active
const isRouteActive = (currentPath: string, itemPath: string) => {
  if (itemPath === "#") return false;
  return currentPath.startsWith(itemPath);
};

type NavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: (NavItem | { title: string; url: string })[];
};

export function NavMain({ items = data }: { items?: NavItem[] }) {
  const pathname = usePathname();

  // Recursive function to render menu items
  const renderMenuItem = (item: NavItem | { title: string; url: string }) => {
    if (!pathname) return null;
    const isActive = "url" in item && item.url ? isRouteActive(pathname, item.url) : false;
    const hasActiveChild =
      "items" in item &&
      item.items?.some((subItem) =>
        "url" in subItem && subItem.url ? isRouteActive(pathname, subItem.url) : false
      );

    if (!("items" in item)) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            data-active={isActive}
            className={cn(
              "relative",
              "before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[2px] before:-translate-y-1/2 before:rounded-l before:bg-primary before:opacity-0 before:transition-opacity",
              "data-[active=true]:bg-muted data-[active=true]:before:opacity-100"
            )}
          >
            <Link href={item?.url ?? "#"} className="w-full max-w-full">
              {"icon" in item && item.icon && (
                <item.icon
                  className={cn(
                    "shrink-0 text-muted-foreground transition-colors",
                    "group-hover:text-foreground",
                    isActive && "text-foreground"
                  )}
                />
              )}
              <span
                className={cn(
                  "truncate text-muted-foreground transition-colors",
                  "group-hover:text-foreground",
                  isActive && "font-medium text-foreground"
                )}
              >
                {item.title}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible
        key={item.title}
        asChild
        defaultOpen={isActive || hasActiveChild}
        className="group/collapsible"
      >
        <SidebarMenuItem className="p-0">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.title}
              data-active={isActive || hasActiveChild}
              asChild
            >
              <Link href={item?.url ?? "#"} className="w-full max-w-full">
                {item.icon && (
                  <item.icon
                    className={cn(
                      "shrink-0 text-muted-foreground transition-colors",
                      "group-hover:text-foreground",
                      (isActive || hasActiveChild) && "text-foreground"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "truncate text-muted-foreground transition-colors",
                    "group-hover:text-foreground",
                    (isActive || hasActiveChild) && "font-medium text-foreground"
                  )}
                >
                  {item.title}
                </span>
                <div className="ml-auto shrink-0 rounded-md p-1 hover:bg-muted-foreground/20">
                  <ChevronRightIcon className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </div>
              </Link>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 max-w-full pr-0">
              {item.items?.map((subItem) => renderMenuItem(subItem))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  return (
    <>
      <SidebarGroup
        className={cn(
          "relative max-w-full pl-0",
          "opacity-50 transition-opacity hover:opacity-100"
        )}
      >
        <SidebarGroupLabel className="p-0">
          <Link
            href={routes.home}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "flex w-full max-w-full items-center justify-start gap-2"
            )}
          >
            <ArrowLeftFromLineIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{siteConfig.title} Home</span>
          </Link>
        </SidebarGroupLabel>
      </SidebarGroup>

      <SidebarGroup className="max-w-full">
        <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>
        <SidebarMenu className="max-w-full">
          {items.map((item) => renderMenuItem(item))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
