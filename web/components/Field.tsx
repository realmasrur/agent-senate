// Halftone field with flowing white contour lines (static, no JS).
export default function Field() {
  const ys = Array.from({ length: 9 }, (_, i) => 60 + i * 20);
  return (
    <div className="field" aria-hidden="true">
      <svg viewBox="0 0 1000 240" preserveAspectRatio="none" fill="none" stroke="#fff" strokeWidth="1.6">
        {ys.map((y, i) => (
          <path
            key={y}
            vectorEffect="non-scaling-stroke"
            opacity={0.55 + i * 0.05}
            d={`M0 ${y + 20} C 220 ${y - 70}, 420 ${y + 60}, 640 ${y - 20} S 900 ${y + 50} 1000 ${y - 40}`}
          />
        ))}
      </svg>
    </div>
  );
}
