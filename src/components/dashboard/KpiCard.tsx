import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type KpiCardProps = {
  label: string;
  value: string;
  helperText?: string;
  highlight?: "default" | "warning" | "success";
};

const highlightColors = {
  default: "text.primary",
  warning: "warning.main",
  success: "success.main",
} as const;

export default function KpiCard({
  label,
  value,
  helperText,
  highlight = "default",
}: KpiCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography
          variant="h5"
          component="p"
          color={highlightColors[highlight]}
          sx={{ fontWeight: 500 }}
        >
          {value}
        </Typography>
        {helperText ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {helperText}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
