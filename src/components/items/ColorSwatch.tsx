"use client";

import Box from "@mui/material/Box";

import { getColorSwatchBackground } from "@/lib/items/templates";

type ColorSwatchProps = {
  color: string;
  size?: number;
};

export default function ColorSwatch({ color, size = 16 }: ColorSwatchProps) {
  const background = getColorSwatchBackground(color);
  const isLightColor =
    color === "ホワイト" || color === "オフホワイト" || color === "イエロー";

  return (
    <Box
      aria-label={color}
      title={color}
      sx={{
        width: size,
        height: size,
        borderRadius: 0.5,
        border: "1px solid",
        borderColor: isLightColor ? "grey.400" : "grey.500",
        background,
        flexShrink: 0,
      }}
    />
  );
}
