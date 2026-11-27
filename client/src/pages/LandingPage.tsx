import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import styles from "./LandingPage.module.css";

const services = [
  { name: "Umeed", description: "AI health conversations", href: "#umeed" },
  { name: "Blood Bridge", description: "Requests and volunteers", href: "#blood-bridge" },
  { name: "Community", description: "Health discussions", href: "#community" },
  { name: "Organizations", description: "Profiles and updates", href: "#organizations" },
];

function LandingPage() {
  return (
    <div className={styles.landing}>
      <a className={styles.skipLink} href="#landing-content">
        Skip to content
      </a>
      <main id="landing-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroIntro}>
            <h1 id="hero-title">
              Health support
              <br />
              goes both ways
            </h1>
            <div className={styles.heroAside}>
              <p>
                Health questions, blood requests, and shared experiences.
                <br />
                One community. Yours.
              </p>
              <Button size="lg" asChild>
                <Link to="/signup">
                  Find your community
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <a className={styles.exploreLink} href="#explore">
                Explore Jeevan Verse <ArrowDown aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className={styles.heroPhoto}>
            <img
              src="/images/community-together.webp"
              alt="Three friends sharing a laugh outdoors"
              width="1800"
              height="1200"
              fetchPriority="high"
            />
            <figcaption>
              <span>People make the difference</span>
              <span>A community for everyday health</span>
            </figcaption>
          </figure>
        </section>

        <nav id="explore" className={styles.serviceNav} aria-label="Explore our services">
          {services.map((service) => (
            <a key={service.name} href={service.href}>
              <span>{service.name}</span>
              <span>{service.description}</span>
            </a>
          ))}
        </nav>

        <section id="umeed" className={styles.umeed} aria-labelledby="umeed-title">
          <div className={styles.sectionCopy}>
            <p className={styles.serviceName}>Meet Umeed</p>
            <h2 id="umeed-title">
              Your health questions
              <br />
              In your own words
            </h2>
            <p className={styles.description}>
              Ask Umeed about everyday health or a prescription you’re trying to understand.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/chatbot">Talk to Umeed</Link>
            </Button>
            <p className={styles.finePrint}>Information and support. Not a diagnosis.</p>
          </div>
          <div className={styles.questionBoard}>
            <div className={styles.questionBoardHeading}>
              <span>Umeed</span>
              <span>Your AI health assistant</span>
            </div>
            <p className={styles.questionBoardTitle}>
              What’s on
              <br />
              your mind?
            </p>
            <div className={styles.questions}>
              <p>“How can I build a better sleep routine?”</p>
              <Separator />
              <p>“What should I ask at my next appointment?”</p>
              <Separator />
              <p>“Can you help me understand this prescription?”</p>
            </div>
            <p className={styles.questionBoardFootnote}>Questions you can bring to Umeed</p>
          </div>
        </section>

        <section id="blood-bridge" className={styles.bloodBridge} aria-labelledby="blood-title">
          <div className={styles.bloodCopy}>
            <p className={styles.serviceName}>Blood Bridge</p>
            <h2 id="blood-title">
              Ask for blood support
              <br />
              Or offer yours
            </h2>
            <p>Connect blood requests with people willing to volunteer.</p>
            <div className={styles.bloodActions}>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/bloodbridge">Explore blood requests</Link>
              </Button>
              <Link className={styles.lightLink} to="/bloodbridge/guidelines">
                Before you volunteer
              </Link>
            </div>
            <p className={styles.bloodNote}>
              Volunteer coordination does not confirm donor eligibility or guarantee a match.
            </p>
          </div>
          <div className={styles.bloodVisual} aria-hidden="true">
            <div className={styles.bloodTypes}>
              <span>A+</span>
              <span>B+</span>
              <span>O+</span>
              <span>AB+</span>
              <span>A−</span>
              <span>B−</span>
              <span>O−</span>
              <span>AB−</span>
            </div>
            <span className={styles.bloodVisualCaption}>Different types. One community</span>
          </div>
        </section>

        <section id="community" className={styles.community} aria-labelledby="community-title">
          <figure className={styles.communityPhoto}>
            <img
              src="/images/community-conversation.webp"
              alt="Friends sitting together in a sunny field"
              width="1000"
              height="667"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className={styles.sectionCopy}>
            <p className={styles.serviceName}>The community</p>
            <h2 id="community-title">
              Shared experiences
              <br />A little less alone
            </h2>
            <p className={styles.description}>
              Share an experience. Ask a question. Find a conversation that feels a little like you.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/discussions">Find your conversation</Link>
            </Button>
            <p className={styles.finePrint}>Shared experiences, not professional medical advice.</p>
          </div>
        </section>

        <section id="organizations" className={styles.organizations} aria-labelledby="org-title">
          <div>
            <p className={styles.serviceName}>For health organizations</p>
            <h2 id="org-title">
              A home for your
              <br />
              community health work
            </h2>
          </div>
          <div className={styles.orgAside}>
            <p>
              Give your organization a home. Share health updates and bring people into your work.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/organisation">
                Bring your organization
                <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Link className={styles.textLink} to="/posts">
              Explore organization posts
            </Link>
          </div>
        </section>

        <section className={styles.join} aria-labelledby="join-title">
          <p>Ask a question. Join a conversation. Offer your support.</p>
          <h2 id="join-title">Join Jeevan Verse</h2>
          <Button size="lg" asChild>
            <Link to="/signup">Get started</Link>
          </Button>
          <Link className={styles.textLink} to="/login">
            Already part of Jeevan Verse? Sign in
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Link to="/" className={styles.wordmark} aria-label="Jeevan Verse home">
            <span className="font-samarkan">Jeevan</span> Verse
          </Link>
          <p>Health questions. Blood support. Community.</p>
          <a href="mailto:jeevanverse247@gmail.com">Say hello</a>
        </div>
        <Separator />
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Jeevan Verse</span>
          <p>
            AI and community content are informational. For medical concerns, seek professional
            care.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
