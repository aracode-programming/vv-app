"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LogoutIcon from "@mui/icons-material/Logout";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import MobileBottomNav from "@/components/layout/MobileBottomNav";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

const desktopNavItems = [
  { href: "/", label: "ダッシュボード", icon: DashboardIcon },
  { href: "/items", label: "商品管理", icon: InventoryIcon },
  { href: "/orders", label: "発注管理", icon: LocalShippingIcon },
];

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "分析";
  if (pathname === "/items/new") return "商品登録";
  if (pathname.startsWith("/items/") && pathname.endsWith("/edit")) return "商品編集";
  if (pathname.startsWith("/items")) return "在庫一覧";
  if (pathname.startsWith("/orders")) return "発注管理";
  return "VV 古着管理";
}

export default function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const pageTitle = title ?? getPageTitle(pathname);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 2 },
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {pageTitle}
          </Typography>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              flexGrow: 1,
            }}
          >
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={isActive ? "primary" : "inherit"}
                  variant={isActive ? "contained" : "text"}
                  startIcon={<Icon />}
                  size="small"
                >
                  {item.label}
                </Button>
              );
            })}
            <Button
              component={Link}
              href="/items/new"
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              sx={{ ml: 1 }}
            >
              新規登録
            </Button>
          </Box>

          <IconButton
            color="inherit"
            onClick={handleLogout}
            aria-label="ログアウト"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <LogoutIcon />
          </IconButton>

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 },
          flexGrow: 1,
          pb: { xs: 10, md: 4 },
        }}
      >
        {children}
      </Container>

      <MobileBottomNav />
    </Box>
  );
}
