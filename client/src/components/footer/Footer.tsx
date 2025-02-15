'use client';
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram, Twitter, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const legalLinks = [
    { text: "Terms of Service", href: "#" },
    { text: "Privacy Policy", href: "#" },
    { text: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="w-full bg-light-bg/95 dark:bg-dark-bg text-light-text dark:text-dark-text py-8 px-6 border-t border-border">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand Section */}
          <div className="flex flex-col gap-3 items-center md:items-start">
            <div className="text-3xl font-semibold">
              <span className="text-accent font-samarkan">Jeevan</span>
              <span className="text-primary">Verse</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left italic">
              Empowering healthcare through innovative digital solutions and comprehensive medical services.
            </p>
          </div>

          {/* Contact Information - Always Centered */}
          <div className="flex flex-col gap-3 items-center">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-3 items-center">
              <a
                href="mailto:jeevanverse247@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                jeevanverse247@gmail.com
              </a>
              <a
                href="tel:+91 8765432109"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={16} />
                +91 8765432109
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground text-center">
                <MapPin size={16} />
                <span>123 Main Street, City, Country</span>
              </div>
            </div>
          </div>

          {/* Social Links - Center on mobile, Right on desktop */}
          <div className="flex flex-col gap-3 items-center md:items-end">
            <h3 className="text-lg font-semibold">Connect With Us</h3>
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
                  className="hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
            
            {/* Legal Links - Center on mobile, Right on desktop */}
            <div className="flex flex-nowrap justify-center md:justify-end gap-4 mt-3">
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

        {/* Separator */}
        <Separator className="my-4" />

        {/* Bottom Footer - Copyright Only */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} JeevanVerse. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;