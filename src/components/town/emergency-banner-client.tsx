"use client";

import { usePathname } from "next/navigation";

export const EmergencyBannerClient = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	if (pathname === "/emergency" || pathname?.startsWith("/emergency/")) {
		return null;
	}

	return <>{children}</>;
};
