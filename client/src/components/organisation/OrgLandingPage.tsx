import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import styles from "./OrgLandingPage.module.css";

const steps = [
  {
    title: "Register your organization",
    text: "Introduce your team and the work you do.",
  },
  {
    title: "Publish an update",
    text: "Add a title, an image, and your message.",
  },
  {
    title: "Manage your posts",
    text: "Revisit, edit, or remove your published updates.",
  },
];

function OrganizationLandingPage() {
  return (
    <div className={styles.page}>
      <a href="#organization-content" className={styles.skipLink}>
        Skip to content
      </a>
      <main id="organization-content">
        <section className={styles.hero} aria-labelledby="org-hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.label}>Jeevan Verse for organizations</p>
            <h1 id="org-hero-title">
              Your work belongs
              <br />
              in the community.
            </h1>
            <p className={styles.description}>
              Give your health organization a home. Share announcements, events, and updates with
              the Jeevan Verse community.
            </p>
            <div className={styles.actions}>
              <Button size="lg" className="h-12" asChild>
                <Link to="/register">
                  Create an organization account
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Link to="/signin" className={styles.textLink}>
                Already here? Sign in
              </Link>
            </div>
          </div>
          <div className={styles.previewStage}>
            <Card className={styles.postPreview}>
              <CardHeader>
                <CardTitle>Community health team</CardTitle>
                <CardDescription>Health organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.postArtwork}>
                  <p>
                    Make room
                    <br />
                    for your
                    <br />
                    questions
                  </p>
                  <span>At your next health visit</span>
                </div>
                <div className={styles.postText}>
                  <h2>Before your next appointment</h2>
                  <p>Keep a short list of questions to discuss with your care team.</p>
                </div>
              </CardContent>
              <CardFooter>
                <span className={styles.exampleNote}>Example post · Announcement</span>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section id="publishing" className={styles.publishing} aria-labelledby="publishing-title">
          <div className={styles.sectionHeading}>
            <p className={styles.label}>Profiles and publishing</p>
            <h2 id="publishing-title">
              A familiar name.
              <br />A useful update.
            </h2>
            <p className={styles.description}>
              A profile and a publishing space for your organization.
            </p>
          </div>
          <div className={styles.editorialList}>
            <article>
              <h3>An organization profile</h3>
              <p>Your name, your purpose, and contact information, together in one place.</p>
            </article>
            <Separator />
            <article>
              <h3>Posts in your own words</h3>
              <p>Share an image and a message. Choose a category that fits.</p>
            </article>
            <Separator />
            <article>
              <h3>Updates you can manage</h3>
              <p>Find and edit your published posts from your dashboard.</p>
            </article>
          </div>
        </section>

        <section className={styles.community} aria-labelledby="org-community-title">
          <figure>
            <img
              src="/images/community-conversation.webp"
              alt="Friends spending time together outdoors"
              width="1000"
              height="667"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div>
            <p className={styles.label}>A shared health community</p>
            <h2 id="org-community-title">
              Share with the
              <br />
              Jeevan Verse community
            </h2>
            <p className={styles.description}>
              A place for organization updates alongside health discussions, Umeed, and Blood
              Bridge.
            </p>
            <Link to="/" className={styles.textLink}>
              Meet Jeevan Verse
            </Link>
          </div>
        </section>

        <section
          id="getting-started"
          className={styles.gettingStarted}
          aria-labelledby="getting-started-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.label}>Getting started</p>
            <h2 id="getting-started-title">
              Set up your account.
              <br />
              Start sharing.
            </h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.join} aria-labelledby="org-join-title">
          <p>For organizations working in community health</p>
          <h2 id="org-join-title">
            Share your next
            <br />
            health update
          </h2>
          <Button size="lg" className="h-12" asChild>
            <Link to="/register">Create an organization account</Link>
          </Button>
          <Link to="/signin" className={styles.textLink}>
            Sign in to your organization
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Link to="/" className={styles.wordmark}>
            <span className="font-samarkan">Jeevan</span> Verse
          </Link>
          <p>For organizations. For the community</p>
          <a href="mailto:jeevanverse247@gmail.com">Say hello</a>
        </div>
        <Separator />
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Jeevan Verse</span>
          <p>
            Organization posts reflect their authors’ information. For medical concerns, seek
            professional care.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default OrganizationLandingPage;
