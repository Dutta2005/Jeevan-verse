import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Moon, Menu, Landmark } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Button } from "../../ui/button";
import OrgLogoutBtn from "../../organisation/OrgLogoutBtn";
import { Switch } from "../../ui/switch";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../../store/themeSlice";

interface SidebarProps {
  isLoggedIn: boolean;
  theme: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isLoggedIn, theme }) => {
  const dispatch = useDispatch();
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => `
    flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-light-text dark:text-dark-text
    ${
      isActive
          ? "bg-primary/10 text-secondary font-medium shadow-sm dark:text-accent"
        : "hover:text-secondary dark:hover:text-secondary"
    }
  `;

  return (
    <Sheet>
      <SheetTrigger asChild className="h-10 w-10 mr-2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-colors dark:text-dark-text"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-accent/20 bg-light-bg dark:bg-dark-bg w-72"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold text-accent dark:text-accent">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-2">
          {isLoggedIn ? (
            <div className="space-y-2">
              <NavLink 
                to={`/organisation/org-profile/0`} 
                className={navLinkClasses}
                end
              >
                <Landmark className="h-5 w-5" />
                <span className="text-base font-medium">Profile</span>
              </NavLink>
              <NavLink 
                to="/organisation" 
                className={navLinkClasses}
                end
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-base font-medium">Dashboard</span>
              </NavLink>
              <NavLink 
                to="/organisation/posts" 
                className={navLinkClasses}
                end
              >
                <FileText className="h-5 w-5" />
                <span className="text-base font-medium">Posts</span>
              </NavLink>
            </div>
          ) : (
            <div className="space-y-2">
              <NavLink to="/signin" className={navLinkClasses} end>
                <span className="text-base font-medium">Login</span>
              </NavLink>
              <NavLink to="/register" className={navLinkClasses} end>
                <span className="text-base font-medium">Sign up</span>
              </NavLink>
            </div>
          )}
          <hr className="my-3" />
          <div className="mt-auto">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
                <Moon className="h-5 w-5 opacity-70" />
                <span className="font-semibold">
                  Dark Mode
                </span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          <hr className="my-3" />

          {isLoggedIn && (
            <div className="px-2">
            <OrgLogoutBtn />
          </div>)}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;