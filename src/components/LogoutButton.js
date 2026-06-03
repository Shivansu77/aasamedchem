"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ||
        "px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold rounded-xl transition-all cursor-pointer"
      }
    >
      Sign Out
    </button>
  );
}
