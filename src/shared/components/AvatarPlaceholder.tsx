// src/shared/components/AvatarPlaceholder.tsx

const PALETTE = [
  "#E07856",
  "#5B8C7B",
  "#6B7FD7",
  "#C9A66B",
  "#A15C7C",
  "#4F9B8C",
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function AvatarPlaceholder({
  name,
  size = 64,
}: {
  name: string;
  size?: number;
}) {
  const initials =
    name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const color = PALETTE[hashName(name || "?") % PALETTE.length];

  return (
    <div
      style={{ width: size, height: size, backgroundColor: color }}
      className="flex items-center justify-center rounded-full font-medium text-white"
    >
      <span style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
}
