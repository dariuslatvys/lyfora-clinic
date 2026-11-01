/** Compact DNA helix mark for genetic findings (replaces the old "G" badge). */
export function DnaMark({
  title = "DNR / genetinis žymuo",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <span className={`dna-mark ${className}`.trim()} title={title} aria-label={title}>
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4.2 2.2c2.2 1.6 5.4 1.6 7.6 0" />
        <path d="M4.2 5.3c2.2 1.6 5.4 1.6 7.6 0" />
        <path d="M4.2 8.4c2.2 1.6 5.4 1.6 7.6 0" />
        <path d="M4.2 11.5c2.2 1.6 5.4 1.6 7.6 0" />
        <path d="M5 2.5c0 3.5 6 3.5 6 7s-6 3.5-6 7" />
        <path d="M11 2.5c0 3.5-6 3.5-6 7s6 3.5 6 7" />
      </svg>
    </span>
  );
}
