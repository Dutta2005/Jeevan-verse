import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import layout from "@/components/blood bridge/BloodBridge.module.css";
import styles from "./BloodDonationGuidelines.module.css";

export default function BloodDonationGuidelines() {
  return (
    <div className={layout.page}>
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/bloodbridge">
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to requests
        </Link>
      </Button>
      <header className={styles.header}>
        <h1>Blood donation guidelines</h1>
        <p>What to discuss with the blood centre, before and after donation</p>
      </header>
      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="On this page">
          <p>On this page</p>
          <a href="#before-donation">Before you donate</a>
          <a href="#at-the-centre">At the blood centre</a>
          <a href="#after-donation">After donation</a>
          <a href="#donation-sources">Sources</a>
        </nav>
        <div className={styles.article}>
          <Alert role="note">
            <AlertTitle>The blood centre confirms eligibility</AlertTitle>
            <AlertDescription>
              Age, weight, haemoglobin, health history, and the time since your last donation are
              assessed against local requirements. A Jeevan Verse profile or volunteer registration
              does not confirm donor eligibility.
            </AlertDescription>
          </Alert>
          <section id="before-donation">
            <h2>Before you donate</h2>
            <ul>
              <li>Contact the blood bank to confirm where to go and what preparation is needed.</li>
              <li>
                Do not donate while you have an infection or feel unwell. Ask the centre about
                recent illness, surgery, tattoos, or piercings before attending.
              </li>
              <li>
                Discuss medicines, recent travel, pregnancy or breastfeeding, and your previous
                donations with staff. Waiting periods depend on your circumstances and the
                applicable guidelines.
              </li>
            </ul>
            <a
              className={styles.sourceLink}
              href="https://www.who.int/campaigns/world-blood-donor-day/who-can-give-blood"
              target="_blank"
              rel="noopener noreferrer"
            >
              WHO: who can give blood
            </a>
          </section>
          <section id="at-the-centre">
            <h2>At the blood centre</h2>
            <ul>
              <li>
                Answer the screening questions and raise any health concerns before the donation.
              </li>
              <li>
                Expect a health assessment, including a haemoglobin check. The centre decides
                whether you can donate that day.
              </li>
              <li>
                Ask when you can next donate. The interval varies with the donation type and local
                requirements.
              </li>
            </ul>
            <a
              className={styles.sourceLink}
              href="https://www.eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/about.cnt?hmode=DOWNLOADDOCUMENTNHRM&type=20"
              target="_blank"
              rel="noopener noreferrer"
            >
              India: donor selection and deferral guidelines, 2025
            </a>
          </section>
          <section id="after-donation">
            <h2>After donation</h2>
            <ul>
              <li>Take the refreshments provided and follow the staff’s recovery instructions.</li>
              <li>
                Drink fluids, eat well, and avoid strenuous activity and heavy lifting as advised by
                the centre.
              </li>
              <li>
                If you feel light-headed, lie down and let the staff know. Ask the centre for advice
                if you have concerns after leaving.
              </li>
            </ul>
            <a
              className={styles.sourceLink}
              href="https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/donateblood.cnt"
              target="_blank"
              rel="noopener noreferrer"
            >
              eRaktKosh: the donation process and aftercare
            </a>
          </section>
          <footer id="donation-sources" className={styles.references}>
            <h2>Sources</h2>
            <p>
              This overview draws on WHO information, India’s 2025 donor-selection guidance, and
              eRaktKosh’s donation guidance linked above. Follow the instructions given by your
              donation centre.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
