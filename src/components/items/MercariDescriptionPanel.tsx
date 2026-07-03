"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { MERCARI_DESCRIPTION } from "@/lib/items/templates";

export default function MercariDescriptionPanel() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MERCARI_DESCRIPTION);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          メルカリ用 商品説明（VV固定テンプレート）
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          sx={{ minHeight: 40, alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          {copied ? "コピーしました" : "説明文をコピー"}
        </Button>
      </Box>

      {copied ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          クリップボードにコピーしました。メルカリ出品時に貼り付けてください。
        </Alert>
      ) : null}

      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          color: "text.secondary",
          bgcolor: "action.hover",
          p: 2,
          borderRadius: 1,
          fontSize: "0.875rem",
          lineHeight: 1.7,
        }}
      >
        {MERCARI_DESCRIPTION}
      </Typography>
    </Paper>
  );
}
