"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import CanvasComponent from "~/components/Canvas";
import Image from "next/image";

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
        <div className="absolute bottom-4 right-4 flex items-center rounded-md font-bold text-[#a0a0a0]">
          <Image
            src="https://cdn.iconscout.com/icon/free/png-256/free-grey-goose-logo-icon-download-in-svg-png-gif-file-formats--industry-company-brand-food-and-drink-pack-logos-icons-2876016.png"
            alt="gooseLogo"
            className="mb-2 mr-2"
            width={25}
            height={25}
          />
          gooseBoard
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="flex max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-3 flex items-center">
          <Image
            src="https://cdn.iconscout.com/icon/free/png-256/free-grey-goose-logo-icon-download-in-svg-png-gif-file-formats--industry-company-brand-food-and-drink-pack-logos-icons-2876016.png"
            alt="gooseLogo"
            width={50}
            height={50}
            className="mb-2 mr-2"
          />
          <h1 className="ml-2 text-4xl font-bold text-[#a0a0a0]">gooseBoard</h1>
        </div>

        <p className="mb-8 text-gray-500">idk just make some art or whatever</p>

        <button
          onClick={() => signIn("google")}
          className="rounded-md bg-gray-900 px-8 py-3 font-medium text-white transition-colors duration-200 hover:bg-black"
        >
          get started
        </button>
      </div>
    </main>
  );
}
