import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Menu, Moon, User } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Switch } from "../ui/switch";
import { RootState } from "../../store/store";
import { toggleTheme } from "../../store/themeSlice";
import Logoutbtn from "../Logoutbtn";
import { menuOptions } from "../../utils/userMenu";
import Sidebar from "./Sidebar";
import Notifications from "./Notifications";

const Navbar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const theme = useSelector((state: RootState) => state.theme.theme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav className={"fixed w-full top-0 z-50 backdrop-blur-sm "}>
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-12">
          <NavLink to="/" className={"text-xl font-semibold"}>
            <span className="text-accent font-samarkan">Jeevan</span>{" "}
            <span className="text-primary">Verse</span>
          </NavLink>

          {/* Center - Navigation */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList className="flex gap-6">
              {menuOptions.map((option) => {
                return (
                  <NavigationMenuItem
                    key={option.name}
                    className={`${
                      option.auth === isAuthenticated ? "" : "hidden"
                    }`}
                  >
                    <NavLink
                      to={option.link}
                      className={({ isActive }) =>
                        `hover:text-secondary/60 transition-colors font-semibold ${
                          isActive
                            ? "text-secondary"
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

          <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Notifications />
          )}
            <Sidebar />
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden lg:block" asChild>
                <Avatar
                  className={`
                    cursor-pointer 
                    ${
                    isAuthenticated ? "hover:ring-2 hover:ring-accent transition-all" : ""
                    }
                `}
                >
                  <AvatarFallback>
                    {isAuthenticated ? (
                      <User className="h-5 w-5 text-light-text dark:text-dark-text" />
                    ) : (
                      <Menu className="h-5 w-5 text-light-text dark:text-dark-text" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className={`
                w-56 
                p-2 
                rounded-xl 
                shadow-2xl 
                backdrop-blur-md 
                border 
                ${
                    theme === "dark"
                    ? "bg-dark-bg/80 text-dark-text border-secondary/20"
                    : "bg-light-bg/80 text-light-text border-secondary/20"
                }
                `}
              >
                <DropdownMenuItem
                  className="
                    hover:bg-accent/10 
                    rounded-md 
                    transition-colors 
                    focus:bg-accent/10
                "
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 opacity-70" />
                      <span>Dark Mode</span>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>
                </DropdownMenuItem>

                {isAuthenticated && (
                  <>
                    <div className="border-t border-secondary/20 my-1" />

                    <DropdownMenuItem
                      className="
                        hover:bg-accent/10 
                        rounded-md 
                        transition-colors 
                        focus:bg-accent/10
                        text-primary
                    "
                    >
                      <Logoutbtn />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
