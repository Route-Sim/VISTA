export function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block min-w-[18px] px-1.5 text-[11px] leading-4 rounded-[6px] border border-[rgba(210,140,85,0.7)] bg-gradient-to-b from-[#FFE9D7] to-[#FFD8BD] text-[#6a4a3c] text-center">
      {children}
    </span>
  );
}
