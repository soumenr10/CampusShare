import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold">CampusShare</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</Link>
            <Link href="/safety" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Safety Tips</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} CampusShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
