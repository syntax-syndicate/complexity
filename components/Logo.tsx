export function Logo({ dark = false }) {
  return (
    <div style={{ stroke: dark ? "#000000" : "#ffffff" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="200"
        height="200"
        stroke="currentColor"
        className="w-full h-full"
      >
        <path
          d="M100,50 L150,150 L50,150 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />

        <circle cx="100" cy="75" r="20" fill="currentColor" />

        <path d="M100,95 L100,150" stroke="currentColor" strokeWidth="8" />
      </svg>
    </div>
  );
}