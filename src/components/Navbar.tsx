"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/models", label: "Models" },
  { href: "/recents", label: "Recent" },
  { href: "/favorites", label: "Favorites" },
];

export function Navbar(): ReactNode {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 p-4">
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
    </nav>
  );
}
