/** Shared outline icons for health-domain tiles (orbit + women mosaic). */
const ICON_PATH: Record<string, string> = {
  cardiovascular:
    "M19.6 12.55c1.85-2.15 1.55-5.45-.75-7.2-2.05-1.55-5-.95-6.55.85L12 6.55l-.3-.35C10.15 4.4 7.2 3.8 5.15 5.35c-2.3 1.75-2.6 5.05-.75 7.2L12 20.4l7.6-7.85z",
  cardio_metabolic:
    "M19.6 12.55c1.85-2.15 1.55-5.45-.75-7.2-2.05-1.55-5-.95-6.55.85L12 6.55l-.3-.35C10.15 4.4 7.2 3.8 5.15 5.35c-2.3 1.75-2.6 5.05-.75 7.2L12 20.4l7.6-7.85z",
  pharmacogenetics:
    "M9.2 3.2h5.6M12 3.2v5.4L7 17.2a2.55 2.55 0 0 0 2.2 3.7h5.6a2.55 2.55 0 0 0 2.2-3.7L12 8.6V3.2M9.8 14.8h4.4",
  hormones_men:
    "M10.6 12.8a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8zM7.2 21v-2.8a3.4 3.4 0 0 1 6.8 0V21M15.4 4.2l4-4M19.4 1.2h-3.4V4.6",
  hormones_women:
    "M12 12.6a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8zM12 12.6V21M9.2 18.2h5.6",
  reproductive:
    "M12 12.6a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8zM12 12.6V21M9.2 18.2h5.6",
  mental:
    "M9 18.4c-3.15-.75-5.3-3.45-5.3-6.7A6.2 6.2 0 0 1 12 5.6a6.2 6.2 0 0 1 8.3 6.1c0 3.25-2.15 5.95-5.3 6.7L12 21.2 9 18.4zM9.3 11h.02M12 11h.02M14.7 11h.02",
  metabolic:
    "M8 4.3s1.35 4 1.35 6.4S7.7 15 7.7 17.05 9.6 21 12 21s4.3-1.9 4.3-3.95-1.65-4.35-1.65-6.35S16 4.3 16 4.3M10 21.5h4",
  physical:
    "M7.2 8.2 4.6 5.6M16.8 8.2l2.6-2.6M12 3.2v3.2M6.4 12H3.2M20.8 12h-3.2M8.2 16.6 5.4 19.4M15.8 16.6l2.8 2.8M9.2 12a2.8 2.8 0 1 0 5.6 0 2.8 2.8 0 0 0-5.6 0",
  immune:
    "M12 2.6l7.4 2.7v5.5c0 5-3.2 8.6-7.4 9.9-4.2-1.3-7.4-4.9-7.4-9.9V5.3L12 2.6zM12 8v5.4M9.3 10.7h5.4",
  oncology:
    "M12 3v3.4M12 17.6V21M4.7 4.7l2.4 2.4M16.9 16.9l2.4 2.4M3 12h3.4M17.6 12H21M4.7 19.3l2.4-2.4M16.9 7.1l2.4-2.4M12 12.1m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
};

export function CategoryGlyph({ id }: { id: string }) {
  const d = ICON_PATH[id] || ICON_PATH.physical;
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
