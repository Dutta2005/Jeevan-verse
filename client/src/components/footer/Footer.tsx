import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram, Twitter, Phone, Heart } from "lucide-react";

const Footer = () => {
  const legalLinks = [
    { text: "Terms of Service", href: "#" },
    { text: "Privacy Policy", href: "#" },
    { text: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-light-bg/95 to-white dark:from-dark-bg dark:to-dark-bg/95 text-light-text/80 dark:text-dark-text/70 pt-12 pb-6 px-6 border-t border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" fill="#bf2231" />
              <div className="text-3xl font-semibold whitespace-nowrap">
                <span className="text-primary font-samarkan">Jeevan </span>
                <span className="text-accent">Verse</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center">
              Empowering healthcare through innovative digital solutions and comprehensive medical services.
            </p>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <h3 className="text-lg font-semibold text-primary">Contact Us</h3>
            <div className="flex flex-col gap-3 items-center">
              <a
                href="mailto:jeevanverse247@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail size={16} className="group-hover:text-primary" />
                jeevanverse247@gmail.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone size={16} className="group-hover:text-primary" />
                +1234567890
              </a>
            </div>
          </div>

          {/* Social Column */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <h3 className="text-lg font-semibold text-primary">Connect With Us</h3>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "#", label: "Instagram" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10 group"
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6 opacity-50" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} JeevanVerse. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 order-1 md:order-2">
            {legalLinks.map((link, index) => (
              <div key={link.text} className="flex items-center">
                <Link
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.text}
                </Link>
                {index < legalLinks.length - 1 && (
                  <Separator orientation="vertical" className="h-4 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;