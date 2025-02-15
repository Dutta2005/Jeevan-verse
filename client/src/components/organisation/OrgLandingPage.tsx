import {
    BellRing,
    RefreshCw,
    CalendarDays,
    ScrollText,
    MessageSquare,
    ArrowRight,
    ChevronRight,
    Users,
    TrendingUp,
    Calendar,
    Info,
  } from "lucide-react";
  import { Card } from "../ui/card";
  import { useNavigate } from "react-router";
  import { Button } from "../ui/button";
  import { Marquee } from "../ui/marquee";
import Footer from "../footer/Footer";
  
  const CampaignCard = ({
    title,
    description,
    icon: Icon,
    category,
    date,
  }: any) => (
    <div className="w-[320px] relative group cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 rounded-2xl transition-all duration-300 group-hover:from-primary/20 dark:group-hover:from-primary/30" />
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-bg/50 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20 transition-colors duration-300 group-hover:bg-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-accent/10 text-accent">
              {category}
            </span>
          </div>
  
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
            {title}
          </h3>
          <p className="text-light-text/70 dark:text-dark-text/70 mb-6 flex-grow text-sm">
            {description}
          </p>
  
          {date && (
            <div className="flex items-center text-sm text-light-text/60 dark:text-dark-text/60 pt-4 border-t border-light-text/10 dark:border-dark-text/10">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{date}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const FeatureCard = ({ icon: Icon, title, description }: any) => (
    <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] group cursor-pointer">
      <Card className="h-full bg-white dark:bg-dark-bg/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20 transition-colors duration-300 group-hover:bg-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
            {title}
          </h3>
          <p className="text-light-text/70 dark:text-dark-text/70 text-sm">
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
  
  const features = [
    {
      icon: BellRing,
      title: "Announcements",
      description: "Share important updates and critical information instantly with your community members.",
    },
    {
      icon: CalendarDays,
      title: "Event Management",
      description: "Organize and promote upcoming events, meetings, and community gatherings effectively.",
    },
    {
      icon: MessageSquare,
      title: "Community Engagement",
      description: "Foster meaningful discussions and connections within your organization.",
    },
    {
      icon: ScrollText,
      title: "Resource Center",
      description: "Create and share important documents, policies, and guidelines in one central location.",
    },
    {
      icon: RefreshCw,
      title: "Regular Updates",
      description: "Keep your community informed about ongoing projects and latest developments.",
    },
    {
      icon: Users,
      title: "Member Directory",
      description: "Connect with other members and build a stronger community network.",
    },
  ];
  
  const campaigns = [
    {
      title: "Emergency Blood Drive",
      description: "Join our urgent blood donation camp. Your contribution can help save lives in critical situations.",
      icon: Users,
      category: "Healthcare",
      date: "February 15, 2025",
    },
    {
      title: "Clean Water Initiative",
      description: "Help us provide clean and safe drinking water to communities in need through local filtration systems.",
      icon: TrendingUp,
      category: "Environment",
      date: "March 10, 2025",
    },
    {
      title: "Community Health Awareness",
      description: "Learn about preventing seasonal diseases through our comprehensive awareness program.",
      icon: Info,
      category: "Education",
      date: "February 20, 2025",
    },
  ];
  
  function OrganizationLandingPage() {
    const navigate = useNavigate();
  
    return (
      <div>
      <div className="min-h-screen bg-light-bg dark:bg-gradient-to-b dark:from-dark-bg/95 dark:to-dark-bg/95 md:px-8">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-3xl lg:text-center lg:mx-auto">
            <h1 className="font-semibold text-3xl md:text-4xl text-light-text/85 dark:text-dark-text/70">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-5xl md:text-7xl font-bold">
                <span className="font-samarkan">Jeevan</span> Verse
              </span>
              <br />
              for organisations
            </h1>
            <p className="text-lg md:text-xl lg:mt-10 text-light-text/80 dark:text-dark-text/80 mt-6 max-w-2xl lg:mx-auto">
              A powerful platform for organizations to connect, communicate, and
              grow their community through engaging content and meaningful
              interactions.
            </p>
            
            <div className="mt-8 lg:mt-12 flex flex-wrap gap-4 md:ml-4 lg:justify-center items-center">
              <Button
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-5 rounded-lg text-lg transition-all duration-300"
                onClick={() => navigate("/register")}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-2 dark:border-primary/30 border-primary/20 hover:border-primary text-primary dark:text-white dark:bg-transparent px-4 py-5 rounded-lg text-lg transition-all duration-300"
                onClick={() => navigate("/signin")}
              >
                Sign In
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
  
        {/* Featured Campaigns */}
        <section className="py-16 lg:px-12 bg-light-bg/50 dark:bg-dark-bg/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 mb-4">
                <span className="text-sm font-medium text-secondary">Featured</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text">
                Active Campaigns
              </h2>
            </div>
            
            <Marquee className="py-4 [--duration:15s]" >
              <div className="flex gap-6 items-center">
                {campaigns.map((campaign, index) => (
                  <CampaignCard key={index} {...campaign} />
                ))}
              </div>
            </Marquee>
          </div>
        </section>
  
        {/* Features */}
        <section className="py-16 lg:px-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 mb-4">
                <span className="text-sm font-medium text-accent">Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text">
                Everything You Need
              </h2>
            </div>
  
            <div className="flex flex-wrap gap-6 justify-center">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
    );
  }
  
  export default OrganizationLandingPage;