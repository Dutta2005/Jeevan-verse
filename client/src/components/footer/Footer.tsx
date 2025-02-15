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
    <footer className="w-full bg-light-bg/95 dark:bg-dark-bg text-light-text dark:text-dark-text py-6 px-6 border-t border-border">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Brand Section */}
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-semibold">
              <span className="text-accent font-samarkan">Jeevan</span>
              <span className="text-primary">Verse</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Empowering healthcare through innovative digital solutions and comprehensive medical services.
            </p>
          </div>

          {/* Contact Information - Centered */}
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-base font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-2 items-center">
              <a
                href="mailto:jeevanverse247@gmail.com"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={14} />
                jeevanverse247@gmail.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={14} />
                +1 (234) 567-890
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={14} />
                <span>123 Healthcare Avenue, Medical District</span>
              </div>
            </div>
          </div>

          {/* Social Links - Right Aligned */}
          <div className="flex flex-col gap-2 items-end">
            <h3 className="text-base font-semibold">Connect With Us</h3>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "#", label: "Instagram" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            
            {/* Legal Links moved under social links */}
            <div className="flex flex-wrap justify-end gap-3 mt-2">
              {legalLinks.map((link, index) => (
                <div key={link.text} className="flex items-center">
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <Separator orientation="vertical" className="h-3 mx-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-3" />

        {/* Bottom Footer - Copyright Only */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JeevanVerse. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;