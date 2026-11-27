import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router";
import { Moon, Sun, User } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { RootState } from "../../store/store";
import { toggleTheme } from "../../store/themeSlice";
import Logoutbtn from "../Logoutbtn";
import { menuOptions } from "../../utils/userMenu";
import Sidebar from "./Sidebar";
import Notifications from "./Notifications";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const theme = useSelector((state: RootState) => state.theme.theme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed w-full top-0 z-50 backdrop-blur-sm",
        !isAuthenticated && "border-b border-border bg-background/95 text-foreground",
      )}
    >
      <div
        className={cn("w-full px-4", !isAuthenticated && "mx-auto max-w-[1440px] px-6 sm:px-[5vw]")}
      >
        <div className={cn("flex items-center justify-between", isAuthenticated ? "h-12" : "h-16")}>
          <NavLink to="/" className={"text-xl font-semibold"}>
            <span
              className={cn("font-samarkan", isAuthenticated ? "text-primary" : "text-foreground")}
            >
              Jeevan
            </span>{" "}
            <span className={isAuthenticated ? "text-primary" : "text-foreground"}>Verse</span>
          </NavLink>

          {/* Center - Navigation */}
          <NavigationMenu className={cn("hidden lg:block", !isAuthenticated && "lg:hidden")}>
            <NavigationMenuList className="flex gap-6">
              {menuOptions.map((option) => {
                return (
                  <NavigationMenuItem
                    key={option.name}
                    className={`${option.auth === isAuthenticated ? "" : "hidden"}`}
                  >
                    <NavLink
                      to={option.link}
                      className={({ isActive }) =>
                        `hover:text-primary/60 transition-colors font-semibold ${
                          isActive
                            ? "text-primary"
                            : theme === "dark"
                              ? "text-dark-text/80"
                              : "text-light-text"
                        }`
                      }
                    >
                      {option.name}
                    </NavLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {!isAuthenticated && (
            <div className="hidden items-center gap-8 text-sm lg:flex">
              <a href="/#umeed" className="underline-offset-4 hover:underline">
                Umeed
              </a>
              <a href="/#blood-bridge" className="underline-offset-4 hover:underline">
                Blood Bridge
              </a>
              <a href="/#community" className="underline-offset-4 hover:underline">
                Community
              </a>
              <a href="/#organizations" className="underline-offset-4 hover:underline">
                Organizations
              </a>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4">
            {!isAuthenticated && (
              <>
                <NavLink
                  to="/login"
                  className="hidden text-sm underline-offset-4 hover:underline sm:inline-flex"
                >
                  Sign in
                </NavLink>
                <Button size="sm" className="hidden sm:inline-flex" asChild>
                  <NavLink to="/signup">Join us</NavLink>
                </Button>
              </>
            )}
            {isAuthenticated && <Notifications />}
            <Sidebar />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={handleThemeToggle}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Account menu" className="hidden lg:block" asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarFallback>
                      <User className="size-5" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Logoutbtn />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
