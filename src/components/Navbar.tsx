"use client";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav
      id="navbar"
      className="flex flex-row justify-between items-center h-16 px-6 py-2 fixed top-0 right-0 left-0 bg-blue-500 z-50"
    >
      <h2 className="text-white font-bold text-xl">
        <Link href="/">Google Calendar Wrapped</Link>
      </h2>
    </nav>
  );
};

export default Navbar; 