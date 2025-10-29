export function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block min-w-[18px] rounded-[6px] border border-[rgba(210,140,85,0.7)] bg-gradient-to-b from-[#FFE9D7] to-[#FFD8BD] px-1.5 text-center text-[11px] leading-4 text-[#6a4a3c]">
      {children}
    </span>
  );
}
