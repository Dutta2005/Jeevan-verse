import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router";
import RequestForm from "@/components/blood bridge/RequestForm";
import Requests from "@/components/blood bridge/Requests";
import UserRequests from "@/components/blood bridge/UserRequests";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useRequestFilters } from "@/components/blood bridge/useRequestFilters";
import styles from "@/components/blood bridge/BloodBridge.module.css";

export default function BloodBridge() {
  const [search, setSearch] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterSidebarId = useId();
  const { sidebarExpanded, toggleSidebar, activeCount } = useRequestFilters();
  const view = search.get("view") === "mine" ? "mine" : "browse";
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Blood requests</h1>
          <p>Find a request to support, or share what’s needed</p>
        </div>
        <Link to="/bloodbridge/guidelines" className={styles.guidelines}>
          Blood donation guidelines
        </Link>
      </header>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Tabs
          value={view}
          onValueChange={(value) =>
            setSearch(value === "mine" ? { view: "mine" } : {}, { replace: true })
          }
        >
          <div className={styles.viewBar}>
            <div className={styles.viewControls}>
              <TabsList aria-label="Blood request views">
                <TabsTrigger value="browse">Browse requests</TabsTrigger>
                <TabsTrigger value="mine">My requests</TabsTrigger>
              </TabsList>
              {view === "browse" && (
                <>
                  <Button
                    variant="outline"
                    className={styles.desktopFilters}
                    aria-expanded={sidebarExpanded}
                    aria-controls={filterSidebarId}
                    onClick={toggleSidebar}
                  >
                    {sidebarExpanded
                      ? "Hide filters"
                      : `Filters${activeCount ? ` (${activeCount})` : ""}`}
                  </Button>
                  <SheetTrigger asChild>
                    <Button variant="outline" className={styles.mobileFilters}>
                      Filters{activeCount ? ` (${activeCount})` : ""}
                    </Button>
                  </SheetTrigger>
                </>
              )}
            </div>
            <RequestForm />
          </div>
          <TabsContent value="browse">
            <Requests
              filterSidebarId={filterSidebarId}
              onCloseFilters={() => setFiltersOpen(false)}
            />
          </TabsContent>
          <TabsContent value="mine">
            <UserRequests />
          </TabsContent>
        </Tabs>
      </Sheet>
      <p className={styles.note}>
        Volunteer coordination does not verify donor eligibility or guarantee a donation. Confirm
        donation requirements with the hospital or blood bank.
      </p>
    </div>
  );
}
