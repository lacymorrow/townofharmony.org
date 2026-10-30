"use client";

import { AlertTriangle, Calendar, Menu, Phone, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DataLink } from "@/components/primitives/data-link";
import { useState } from "react";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { TownSearch } from "@/components/town/town-search";
import { Button } from "@/components/ui/button";
import { getMapUrl } from "@/lib/map-utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

import { navigation as defaultNavData } from "@/data/town/navigation";
import type { TownNavigation, TownSettings } from "@/data/town/types";
import { BUILD_TIME_HIDDEN_HREFS, normalizeHref } from "@/lib/hidden-hrefs";

interface TownHeaderProps {
  settings: TownSettings;
  /** Override hidden hrefs from a server component (supports preview cookie). Falls back to build-time env. */
  hiddenHrefs?: Set<string>;
  /** Navigation tree (defaults to static data). Server wrapper passes the Builder-merged version. */
  navData?: TownNavigation;
}

export function TownHeader({
  settings,
  hiddenHrefs = BUILD_TIME_HIDDEN_HREFS,
  navData = defaultNavData,
}: TownHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigation = navData.mainNav.reduce<typeof navData.mainNav>((acc, item) => {
    const normalizedHref = normalizeHref(item.href);
    const isParentHidden = hiddenHrefs.has(normalizedHref);

    if (item.children) {
      const visibleChildren = item.children.filter((c) => !hiddenHrefs.has(normalizeHref(c.href)));
      const [first] = visibleChildren;
      if (first) {
        acc.push({
          ...item,
          href: isParentHidden ? first.href : item.href,
          children: visibleChildren,
        });
      }
    } else if (!isParentHidden) {
      acc.push(item);
    }
    return acc;
  }, []);

  return (
    <header>
      {/* Skip navigation link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-sage-dark focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      {/* Top bar - sage deep */}
      <div className="bg-sage-deep text-white/90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-1">
                <a
                  href={`tel:${settings.contactInfo.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-1 transition-colors hover:text-white"
                >
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {settings.contactInfo.phone}
                </a>
                <PhoneCopyButton phone={settings.contactInfo.phone} tone="onDark" />
              </span>
              <span className="hidden items-center gap-1 md:inline-flex">
                <a
                  href={getMapUrl(settings.contactInfo.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {settings.contactInfo.address}
                </a>
                <AddressCopyButton address={settings.contactInfo.address} tone="onDark" />
              </span>
            </div>
            <div className="flex items-center gap-4">
              {process.env.NEXT_PUBLIC_FEATURE_EVENTS_ENABLED === "true" && (
                <Link
                  href="/events"
                  className="flex items-center gap-1 transition-colors hover:text-white"
                >
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  Events
                </Link>
              )}
              {process.env.NEXT_PUBLIC_FEATURE_ALERTS_ENABLED === "true" && (
                <Link
                  href="/emergency"
                  className="flex items-center gap-1 transition-colors hover:text-white"
                >
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Emergency Info
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-[#DDD7CC] bg-warm-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo with shield */}
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/images/town/shield.svg"
                alt="Town of Harmony Shield"
                width={66}
                height={56}
                className="flex-shrink-0"
                unoptimized
                priority
              />
              <div>
                {/* Not an h1: the header repeats on every page, so the page's own heading owns the h1 (LAC-3516) */}
                <p className="font-serif text-2xl font-bold text-sage-dark">{settings.siteTitle}</p>
                <p className="text-sm font-semibold uppercase tracking-[1.5px] text-[#635E56]">
                  {settings.branding.county}, {settings.branding.state}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigation.map((item) => {
                    if (item.children) {
                      return (
                        <NavigationMenuItem key={item.name}>
                          <NavigationMenuTrigger className="rounded-md bg-transparent px-4 py-2 text-[15px] font-medium text-[#4A4640] transition-colors hover:bg-stone hover:text-sage-dark">
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                              {item.children.map((child) => (
                                <li key={child.name}>
                                  <NavigationMenuLink asChild>
                                    <DataLink
                                      href={child.href}
                                      className={cn(
                                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-stone hover:text-sage-dark focus:bg-stone focus:text-sage-dark"
                                      )}
                                    >
                                      <div className="text-sm font-medium leading-none">
                                        {child.name}
                                      </div>
                                    </DataLink>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }
                    return (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuLink asChild>
                          <DataLink
                            href={item.href}
                            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[15px] font-medium text-[#4A4640] transition-colors hover:bg-stone hover:text-sage-dark focus:bg-stone focus:text-sage-dark focus:outline-none"
                          >
                            {item.name}
                          </DataLink>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Search and Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Desktop: clickable search input */}
              <button
                type="button"
                aria-label="Open search"
                className="hidden w-48 items-center gap-2 rounded-md border border-[#DDD7CC] bg-stone/50 px-3 py-1.5 text-sm text-[#635E56] transition-colors hover:bg-stone hover:text-sage-dark md:flex lg:w-64"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Search...</span>
                <kbd className="ml-auto hidden rounded border border-[#DDD7CC] bg-warm-white px-1.5 py-0.5 font-mono text-xs text-[#635E56] lg:inline-block">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile: magnifying glass always visible */}
              <Button
                variant="ghost"
                size="icon"
                className="text-sage-dark hover:bg-stone hover:text-sage-dark md:hidden"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-sage-dark hover:bg-stone hover:text-sage-dark lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#DDD7CC] bg-warm-white lg:hidden"
        >
          <div className="container mx-auto px-4 py-2">
            <button
              type="button"
              aria-label="Open search"
              className="mb-2 flex w-full items-center gap-2 rounded-md border border-[#DDD7CC] bg-stone/50 px-3 py-2 text-sm text-[#635E56]"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search...
            </button>
            {navigation.map((item) => (
              <div key={item.name}>
                <DataLink
                  href={item.href}
                  className="block py-2 text-[#2D2A24] transition-colors hover:text-sage-dark"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </DataLink>
                {item.children && (
                  <div className="ml-4">
                    {item.children.map((child) => (
                      <DataLink
                        key={child.name}
                        href={child.href}
                        className="block py-1 text-sm text-[#4A4640] transition-colors hover:text-sage-dark"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </DataLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}

      <TownSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
