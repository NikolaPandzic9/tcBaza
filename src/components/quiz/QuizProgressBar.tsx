interface QuizProgressBarProps {
  current: number;
  total: number;
  label: string;
}

export function QuizProgressBar({ current, total, label }: QuizProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      className="h-1.5 w-full overflow-hidden bg-white/10"
    >
      <div
        className="h-full bg-accent-500 transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
