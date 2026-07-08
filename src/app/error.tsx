"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import AppShell from "@/components/layout/AppShell";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <AppShell>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          データの取得に失敗しました。Google Sheets の接続設定を確認してください。
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          本番環境では詳細エラーが非表示になることがあります。ログイン後に{" "}
          <strong>/api/sheets/status</strong> を開くと原因を確認できます。
        </Typography>
        {error.digest ? (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            エラーID: {error.digest}
          </Typography>
        ) : null}
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={reset}>
          再読み込み
        </Button>
      </Box>
    </AppShell>
  );
}
