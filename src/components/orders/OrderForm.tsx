"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  createOrderAction,
  type OrderActionState,
} from "@/app/orders/actions";
import { getTodayDateString } from "@/lib/orders/rules";

type OrderFormProps = {
  nextOrderId: string;
};

const initialState: OrderActionState = {};

const fieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 48,
    fontSize: "1rem",
  },
};

export default function OrderForm({ nextOrderId }: OrderFormProps) {
  const [state, formAction, isPending] = useActionState(
    createOrderAction,
    initialState,
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
        発注を登録
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        届いた荷物の発注IDを作成します。商品登録時にこの発注IDを選択できます。
      </Typography>

      <Box component="form" action={formAction}>
        {state.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <TextField
            label="発注ID"
            fullWidth
            value={nextOrderId}
            disabled
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="登録時に自動採番されます"
          />

          <TextField
            name="eventDate"
            label="届いた日付"
            type="date"
            required
            fullWidth
            defaultValue={getTodayDateString()}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            name="quantity"
            label="仕入枚数"
            type="number"
            required
            fullWidth
            placeholder="例: 50"
            sx={fieldSx}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: 1, step: 1 },
            }}
          />

          <TextField
            name="totalItemCost"
            label="仕入れ値 (円)"
            type="number"
            required
            fullWidth
            placeholder="例: 25000"
            sx={fieldSx}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: 0, step: 1 },
            }}
          />

          <TextField
            name="shippingCost"
            label="送料 (円)"
            type="number"
            required
            fullWidth
            placeholder="例: 1200"
            sx={fieldSx}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: 0, step: 1 },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{
              minHeight: 48,
              px: 3,
              whiteSpace: "nowrap",
              alignSelf: { xs: "stretch", md: "flex-start" },
              mt: { xs: 0, md: 0 },
            }}
          >
            {isPending ? "登録中..." : "発注を登録"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
