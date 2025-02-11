import { Menu, Moon, User } from "lucide-react";
import { menuOptions } from "../../utils/userMenu";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router";
import { RootState } from "../../store/store";
import { toggleTheme } from "../../store/themeSlice";
import { Switch } from "../ui/switch";
import Logoutbtn from "../Logoutbtn";
import { ScrollArea } from "../ui/scroll-area";

function Sidebar() {
  const dispatch = useDispatch();
  const name = useSelector((state: RootState) => state.auth.user?.name);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const theme = useSelector((state: RootState) => state.theme.theme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center space-x-3 p-2 transition-all duration-200 
    ${isActive 
      ? "bg-primary/10 text-primary font-medium" 
      : "text-light-text dark:text-dark-text hover:text-secondary dark:hover:text-secondary"}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild className="h-10 w-10 bg-transparent lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-colors dark:text-dark-text border-none"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-accent/20 bg-light-bg dark:bg-dark-bg w-64"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-accent dark:text-accent flex items-center gap-2">
            <User className="mr-2 h-5 w-5" />
            <span>{name?.split(" ")[0]}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full">
        <nav className="mt-8 flex flex-col gap-2">
          {menuOptions.map((option) => (
            <NavLink
              key={option.name}
              to={option.link}
              className={({ isActive }) => `${option.auth === isAuthenticated ? "" : "hidden"} ${navLinkClasses({ isActive })}`}
            >
              <span>{option.name}</span>
            </NavLink>
          ))}
          <hr />
          <div className="mt-auto">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
                <Moon className="h-5 w-5 opacity-70" />
                <span className="font-semibold">Dark Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          <hr />
          {isAuthenticated && (
            <div className="px-2 my-2">
              <Logoutbtn />
            </div>
          )}
        </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default Sidebar;