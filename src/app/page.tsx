"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import CanvasComponent from "~/components/Canvas";

export default function HomePage() {
  const { data: session } = useSession();
  if (session) {
    return (
      <main className="relative h-screen w-full">
        <button
          onClick={() => signOut()}
          className="absolute right-4 top-4 z-10 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Sign Out
        </button>

        <CanvasComponent />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="mt-4 rounded-md bg-black px-4 py-2 text-white"
      >
        Sign in
      </button>
    </main>
  );
}
