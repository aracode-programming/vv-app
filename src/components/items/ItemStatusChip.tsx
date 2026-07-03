import Chip from "@mui/material/Chip";

import type { ItemStatus } from "@/lib/sheets/types";

type ItemStatusChipProps = {
  status: ItemStatus;
  exchangeAlert?: boolean;
  size?: "small" | "medium";
};

const statusColors: Record<
  string,
  "default" | "primary" | "success" | "warning" | "error" | "info"
> = {
  在庫: "default",
  出品中: "primary",
  売却済: "success",
  交換済: "info",
};

export default function ItemStatusChip({
  status,
  exchangeAlert = false,
  size = "small",
}: ItemStatusChipProps) {
  if (exchangeAlert && status === "出品中") {
    return (
      <Chip
        label="交換推奨"
        color="warning"
        size={size}
        variant="filled"
      />
    );
  }

  return (
    <Chip
      label={status || "—"}
      color={statusColors[status] ?? "default"}
      size={size}
      variant="outlined"
    />
  );
}
