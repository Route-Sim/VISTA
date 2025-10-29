export function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block min-w-[18px] rounded-[6px] border border-black bg-gradient-to-b from-gray-200 to-gray-100 px-1.5 text-center text-[11px] leading-4 text-black">
      {children}
    </span>
  );
}
