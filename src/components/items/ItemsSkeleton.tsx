import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

export default function ItemsSkeleton() {
  return (
    <Box>
      <Skeleton width="40%" height={36} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={80} height={36} />
        ))}
      </Box>
      <Grid container spacing={1.5}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Skeleton width="30%" />
                <Skeleton width="80%" />
                <Skeleton width="50%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
