import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { formatNumber } from "@/lib/format";

type AiInsightsSectionProps = {
  aiInsights: string;
  aiPickRecommendations: string;
  aiRecommendQty: number | null;
};

export default function AiInsightsSection({
  aiInsights,
  aiPickRecommendations,
  aiRecommendQty,
}: AiInsightsSectionProps) {
  const hasContent =
    Boolean(aiInsights) ||
    Boolean(aiPickRecommendations) ||
    aiRecommendQty !== null;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoAwesomeIcon color="primary" fontSize="small" />
          <Typography variant="h6">AI 分析サマリー</Typography>
        </Box>

        {!hasContent ? (
          <Typography variant="body2" color="text.secondary">
            AI分析データはまだ登録されていません。ステップ5で自動分析を実装します。
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {aiRecommendQty !== null ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  今月のAI発注推奨数
                </Typography>
                <Typography variant="h6">
                  {formatNumber(aiRecommendQty, "着")}
                </Typography>
              </Box>
            ) : null}

            {aiPickRecommendations ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ピック仕入れ推奨
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {aiPickRecommendations}
                </Typography>
              </Box>
            ) : null}

            {aiInsights ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  分析コメント
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {aiInsights}
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
