import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { BorderBeam } from "../components/ui/border-beam";
import Umeed from "@/components/landing page/Umeed";
import BloodBridge from "@/components/landing page/BloodBridge";
import ChitChat from "@/components/landing page/ChitChat";
import Campaign from "@/components/landing page/Campaign";
import Footer from "@/components/footer/Footer";
const HeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary opacity-10 blur-[100px]" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent opacity-10 blur-[100px]" />
  </div>
);

function LandingPage() {
  return (
    <div>
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white dark:from-dark-bg dark:to-dark-bg/95 dark:text-dark-text -mt-16 pb-10 pt-10">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] md:min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <HeroBackground />
        <div className="relative space-y-12 max-w-4xl mx-auto">
          <div className="space-y-6 mt-16 md:mt-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
              <span className="text-sm font-medium text-primary animate-pulse">
                ✨ Welcome to the future of healthcare
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                <span className="font-samarkan">Jeevan</span> Verse
              </span>
            </h1>
            <p className="text-lg md:text-xl text-light-text/80 dark:text-dark-text/80 max-w-2xl mx-auto leading-relaxed">
              Find symptoms, request blood, join discussions, and support health
              campaigns—all in one place.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg px-4 py-2 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="group flex items-center gap-2 bg-white dark:bg-dark-bg border-2 border-primary/20 hover:border-primary text-primary dark:text-white rounded-lg px-4 py-2 text-base font-medium transition-all duration-300"
            >
              Sign In
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-8 space-y-4 pb-10">
            <p className="text-lg text-light-text/70 dark:text-dark-text/70">
              Are you an organization?
            </p>
            <Link
              to="/organisation"
              className="inline-flex items-center gap-2 text-gray-900 dark:text-dark-text rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">Be a part of our journey</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <BorderBeam size={100} />
            </Link>
          </div>
        </div>
      </section>

      <Umeed />
      <BloodBridge />
      <ChitChat />
      <Campaign />
    </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
