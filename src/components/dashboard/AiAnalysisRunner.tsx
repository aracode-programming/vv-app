"use client";

import { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { formatNumber } from "@/lib/format";

type AiAnalysisRunnerProps = {
  aiInsights: string;
  aiPickRecommendations: string;
  aiRecommendQty: number | null;
  yearMonth?: string;
};

export default function AiAnalysisRunner({
  aiInsights: initialInsights,
  aiPickRecommendations: initialPicks,
  aiRecommendQty: initialQty,
  yearMonth,
}: AiAnalysisRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState(initialInsights);
  const [picks, setPicks] = useState(initialPicks);
  const [qty, setQty] = useState(initialQty);

  const hasContent = Boolean(insights) || Boolean(picks) || qty !== null;

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    setError("");

    try {
      const response = await fetch("/api/ai/analyze", { method: "POST" });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        aiRecommendQty?: number;
        aiPickRecommendations?: string;
        aiInsights?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "AI分析に失敗しました。");
        return;
      }

      setQty(data.aiRecommendQty ?? null);
      setPicks(data.aiPickRecommendations ?? "");
      setInsights(data.aiInsights ?? "");
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography variant="h6">AI 分析サマリー</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={
              isRunning ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={handleRunAnalysis}
            disabled={isRunning}
            sx={{ minHeight: 44, flexShrink: 0 }}
          >
            {isRunning ? "分析中..." : "AI分析を実行"}
          </Button>
        </Box>

        {yearMonth ? (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            対象月: {yearMonth}
          </Typography>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {!hasContent ? (
          <Typography variant="body2" color="text.secondary">
            「AI分析を実行」を押すと、在庫・売上データをもとにClaudeが今月の仕入推奨数と経営アドバイスを生成します。
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {qty !== null ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  今月のAI発注推奨数
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {formatNumber(qty, "着")}
                </Typography>
              </Box>
            ) : null}

            {picks ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ピック仕入れ推奨
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {picks}
                </Typography>
              </Box>
            ) : null}

            {insights ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  分析コメント
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {insights}
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
