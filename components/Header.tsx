// developers: Victoria Mulugeta, Maarten Lopes
"use client"
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#1F2937] text-white flex justify-between items-center h-20 px-8 shadow-md">
      <h2 className="text-3xl font-bold tracking-wide">
        Budget Buddy
      </h2>
      {/* Navigation Links */}
      <nav className="flex space-x-6 text-lg font-medium">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/transactions/create" className="hover:underline">Create</Link>
        <Link href="/transactions" className="hover:underline">All Transactions</Link>
      </nav>
    </header>
  );
}
