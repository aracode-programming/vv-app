import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

function KpiSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={36} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}

export default function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton width={200} height={40} sx={{ mb: 1 }} />
      <Skeleton width={320} height={20} sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiSkeleton />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Skeleton width={120} height={28} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={280} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Skeleton width={160} height={28} sx={{ mb: 2 }} />
              <Skeleton height={24} />
              <Skeleton height={24} />
              <Skeleton height={24} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
