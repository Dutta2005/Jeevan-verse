import { Button } from "@/components/ui/button";
import type { BloodRequestPage } from "./blood-request-types";
import styles from "./BloodBridge.module.css";
export default function RequestPagination({
  page,
  onPage,
}: {
  page: BloodRequestPage;
  onPage: (page: number) => void;
}) {
  if (!page.totalPages || page.totalPages <= 1) return null;
  return (
    <nav aria-label="Request pages" className={styles.pagination}>
      <Button
        variant="outline"
        disabled={!page.hasPrev}
        onClick={() => onPage(Math.max(1, page.currentPage - 1))}
      >
        Previous
      </Button>
      <span aria-live="polite">
        Page {page.currentPage} of {page.totalPages}
      </span>
      <Button
        variant="outline"
        disabled={!page.hasNext}
        onClick={() => onPage(page.currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
