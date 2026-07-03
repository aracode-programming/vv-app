import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import AppShell from "@/components/layout/AppShell";
import LinkButton from "@/components/ui/LinkButton";

export default function ItemNotFound() {
  return (
    <AppShell title="商品が見つかりません">
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h6" gutterBottom>
          商品が見つかりません
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          指定された管理番号の商品は存在しないか、削除されています。
        </Typography>
        <LinkButton href="/items" variant="contained">
          在庫一覧に戻る
        </LinkButton>
      </Box>
    </AppShell>
  );
}
