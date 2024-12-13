"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";

const navItems = [
  { href: "/models", label: "Models" },
  { href: "/videos", label: "Videos" },
];

export function Navbar(): ReactNode {
  const pathname = usePathname();
  const { isPrivacyEnabled, togglePrivacy } = usePrivacy();

  return (
    <nav className="bg-zinc-900 p-4">
      <div className="flex justify-between items-center">
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-white hover:text-gray-300 ${
                  pathname === item.href ? "font-bold" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePrivacy}
          className="text-white hover:text-gray-300"
          title={
            isPrivacyEnabled ? "Disable Privacy Mode" : "Enable Privacy Mode"
          }
        >
          {isPrivacyEnabled ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </Button>
      </div>
    </nav>
  );
}
