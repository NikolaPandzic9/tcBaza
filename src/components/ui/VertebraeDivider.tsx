interface VertebraeDividerProps {
  className?: string;
}

// A simplified line-art rendering of the "spine wrapped around the bar"
// detail from the real logo (assets/brend) — the brand's recurring
// injury-prevention/recovery visual signature. Used sparingly (hero
// watermark, About section break, footer) per the design concept.
// Colored via currentColor — set with a text-* class on the wrapper.
export function VertebraeDivider({ className }: VertebraeDividerProps) {
  const ticks = Array.from({ length: 20 }, (_, i) => 6 + i * 12);

  return (
    <svg
      aria-hidden
      viewBox="0 0 240 16"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      fill="none"
    >
      <line x1="0" y1="8" x2="240" y2="8" stroke="currentColor" strokeWidth="1.5" />
      {ticks.map((x) => (
        <line
          key={x}
          x1={x}
          y1="2"
          x2={x - 4}
          y2="14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
