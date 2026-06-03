import Link from "next/link";

export default function ProfileLinkButton({ name, email }) {
  const initial = (name || email || "A").slice(0, 1).toUpperCase();

  return (
    <Link
      href="/profile"
      aria-label="Open profile"
      title="Profile"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-brand-700 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50"
    >
      {initial}
    </Link>
  );
}
