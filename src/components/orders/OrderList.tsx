"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import type { Order } from "@/lib/sheets/types";
import { formatCurrency, formatNumber } from "@/lib/format";

type OrderCardProps = {
  order: Order;
};

const typeColors: Record<string, "primary" | "info" | "default"> = {
  仕入: "primary",
  交換: "info",
};

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {order.eventId}
              </Typography>
              <Chip
                label={order.type}
                size="small"
                color={typeColors[order.type] ?? "default"}
                variant="outlined"
              />
              <Chip label={order.status} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {order.eventDate} ・ {formatNumber(order.quantity, "着")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(order.totalCost)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              原価 {formatCurrency(order.totalItemCost)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

type OrderListProps = {
  orders: Order[];
};

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        発注・交換履歴がまだありません。
      </Typography>
    );
  }

  return (
    <>
      <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
        {orders.map((order) => (
          <OrderCard key={order.eventId} order={order} />
        ))}
      </Stack>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Stack spacing={1}>
          {orders.map((order) => (
            <OrderCard key={order.eventId} order={order} />
          ))}
        </Stack>
      </Box>
    </>
  );
}
