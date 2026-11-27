import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Moon, Sun } from "lucide-react";
import type { RootState } from "@/store/store";
import { toggleTheme } from "@/store/themeSlice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Notifications from "@/components/navbar/Notifications";
import Logoutbtn from "@/components/Logoutbtn";
import OrgLogoutBtn from "@/components/organisation/OrgLogoutBtn";
import styles from "./ProtectedLayout.module.css";
import { UmeedProvider } from "@/components/chatbot/UmeedWorkspace";
import { UmeedHistory } from "@/components/chatbot/SessionSidebar";
import { cn } from "@/lib/utils";

const individualLinks = [
  ["Home", "/"],
  ["Umeed", "/chatbot"],
  ["Blood Bridge", "/bloodbridge"],
  ["Community", "/discussions"],
];
const organizationLinks = [
  ["Home", "/organisation"],
  ["Posts", "/organisation/posts"],
  ["Profile", "/organisation/org-profile/0"],
];

function WorkspaceLayout({
  children,
  audience = "individual",
}: {
  children: ReactNode;
  audience?: "individual" | "organization";
}) {
  const dispatch = useDispatch();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const name = useSelector((state: RootState) =>
    audience === "organization" ? state.auth.organization?.name : state.auth.user?.name,
  );
  const { pathname } = useLocation();
  const isOrganization = audience === "organization";
  const isUmeed = !isOrganization && pathname === "/chatbot";
  const links = isOrganization ? organizationLinks : individualLinks;
  const home = isOrganization ? "/organisation" : "/";
  const pageName =
    [
      ...links,
      ["Notifications", "/notifications"],
      ["Organization profile", "/org-profile"],
      ["Organization post", "/post"],
      ["Profile", "/organisation/org-profile"],
      ["Create post", "/organisation/create"],
      ["Edit post", "/organisation/edit"],
      ["Post", "/organisation/post"],
    ]
      .sort((a, b) => b[1].length - a[1].length)
      .find(([, path]) => pathname === path || pathname.startsWith(`${path}/`))?.[0] ??
    "Jeevan Verse";
  const brand = (
    <Link to={home} className={styles.brand}>
      <span>
        <span className="font-samarkan">Jeevan</span> Verse
      </span>
      <small>{isOrganization ? "Organization account" : "Individual account"}</small>
    </Link>
  );
  const navigation = (
    <nav aria-label="Workspace navigation" className={styles.navigation}>
      {links.map(([label, path]) => (
        <NavLink
          key={path}
          to={path}
          end={path === home}
          className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={styles.shell}>
      <a href="#workspace-content" className={styles.skipLink}>
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        {brand}
        {navigation}
        {isUmeed ? (
          <UmeedHistory />
        ) : (
          <p className={styles.sidebarNote}>Health support goes both ways</p>
        )}
      </aside>
      <div className={cn(styles.workspace, isUmeed && styles.chatWorkspace)}>
        <header className={styles.toolbar}>
          <div className="flex min-w-0 items-center gap-3">
            <div className={styles.mobileMenu}>
              <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation">
                    <Menu aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-8 overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Jeevan Verse</SheetTitle>
                    <SheetDescription>
                      {isOrganization ? "Organization workspace" : "Your health community"}
                    </SheetDescription>
                  </SheetHeader>
                  <nav aria-label="Mobile workspace navigation" className={styles.navigation}>
                    {links.map(([label, path]) => (
                      <NavLink
                        key={path}
                        to={path}
                        onClick={() => setNavigationOpen(false)}
                        end={path === home}
                        className={({ isActive }) =>
                          isActive ? styles.activeLink : styles.navLink
                        }
                      >
                        {label}
                      </NavLink>
                    ))}
                  </nav>
                  {isUmeed && <UmeedHistory onNavigate={() => setNavigationOpen(false)} />}
                </SheetContent>
              </Sheet>
            </div>
            {!isOrganization && pathname === "/" ? (
              <h1 className={styles.pageTitle}>Home</h1>
            ) : (
              <span className={styles.pageTitle} title={pageName}>
                {pageName}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isOrganization && <Notifications />}
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account menu">
                  {name?.trim().charAt(0).toUpperCase() || "A"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-1 px-3 py-3">
                  <p className="break-words text-sm font-medium">{name || "Your account"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isOrganization ? "Organization" : "Individual account"}
                  </p>
                </div>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    {isOrganization ? <OrgLogoutBtn /> : <Logoutbtn />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="workspace-content" tabIndex={-1} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout(props: {
  children: ReactNode;
  audience?: "individual" | "organization";
}) {
  const { pathname } = useLocation();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  return props.audience !== "organization" && pathname === "/chatbot" ? (
    <UmeedProvider key={userId}>
      <WorkspaceLayout {...props} />
    </UmeedProvider>
  ) : (
    <WorkspaceLayout {...props} />
  );
}
