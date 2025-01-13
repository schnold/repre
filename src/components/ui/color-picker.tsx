"use client";

const colors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 ${
            value === color ? "border-black" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          type="button"
        />
      ))}
    </div>
  );
} 