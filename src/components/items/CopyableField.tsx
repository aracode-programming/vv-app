"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type CopyableFieldProps = {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
  multiline?: boolean;
};

export default function CopyableField({
  label,
  value,
  onCopy,
  multiline = false,
}: CopyableFieldProps) {
  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onCopy(label, value);
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCopy(label, value);
        }
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        py: 0.75,
        px: 1,
        mx: -1,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:active": { bgcolor: "action.selected" },
      }}
    >
      <ContentCopyIcon
        sx={{ fontSize: 16, color: "text.secondary", mt: 0.25, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            whiteSpace: multiline ? "pre-wrap" : "nowrap",
            overflow: multiline ? "visible" : "hidden",
            textOverflow: multiline ? "clip" : "ellipsis",
            wordBreak: multiline ? "break-word" : "normal",
          }}
        >
          {multiline && value.length > 80
            ? `${value.slice(0, 80)}…`
            : value}
        </Typography>
      </Box>
    </Box>
  );
}
