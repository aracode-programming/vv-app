"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";

const navItems = [
  {
    href: "/",
    label: "分析",
    icon: DashboardIcon,
    match: (path: string) => path === "/",
  },
  {
    href: "/items",
    label: "在庫",
    icon: InventoryIcon,
    match: (path: string) =>
      path.startsWith("/items") && path !== "/items/new",
  },
  {
    href: "/orders",
    label: "発注",
    icon: LocalShippingIcon,
    match: (path: string) => path.startsWith("/orders"),
  },
  {
    href: "/items/new",
    label: "登録",
    icon: AddIcon,
    match: (path: string) => path === "/items/new",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex((item) => item.match(pathname));

  return (
    <Paper
      elevation={8}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: "divider",
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        showLabels
        sx={{
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            py: 1,
            px: 0.5,
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.65rem",
          },
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              icon={<Icon />}
              value={index}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
