"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
    >
      ログアウト
    </button>
  );
}
