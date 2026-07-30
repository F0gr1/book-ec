"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => void signIn("github", { callbackUrl: "/" })}
      className="flex w-full items-center justify-center rounded bg-gray-900 px-4 py-2 font-bold text-white hover:bg-gray-700"
    >
      Githubでログイン
    </button>
  );
}
