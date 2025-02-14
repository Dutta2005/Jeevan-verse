import { Droplet, Users, Heart, Calendar, Bell, Shield, Activity } from "lucide-react";
import { Card } from "../ui/card";
import { NumberTicker } from "../ui/number-ticker";

export default function BloodBridge () {
    const stats = [
        {
            icon: Droplet,
            label: "Donations Made",
            value: 100,
            suffix: "+",
            color: "primary",
        },
        {
            icon: Users,
            label: "Active Donors",
            value: 50,
            suffix: "+",
            color: "secondary",
        },
        {
            icon: Heart,
            label: "Lives Saved",
            value: 80,
            suffix: "+",
            color: "accent",
        },
        {
            icon: Calendar,
            label: "Monthly Requests",
            value: 60,
            suffix: "+",
            color: "primary",
        },
    ];

    const features = [
        {
            icon: Bell,
            title: "Quick Response",
            description:
                "Get notified instantly through realtime alerts and emails when your blood type is needed",
        },
        {
            icon: Shield,
            title: "Safe & Secure",
            description:
                "Your information is protected and only shared with verified hospitals",
        },
        {
            icon: Activity,
            title: "Real-time Updates",
            description:
                "Track your donation's journey and see the impact you're making in real-time",
        },
    ];

    return (
        <div>
            <section className="relative py-32 overflow-hidden">
                {/* Abstract background pattern */}
                <div className="absolute inset-0 bg-light-bg dark:bg-dark-bg">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                    {/* Subtle red circular elements */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/15"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/15"></div>
                </div>

                <div className="relative container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
                            <span className="text-sm font-medium text-primary">
                                BloodBridge Network
                            </span>
                        </span>

                        <div className="space-y-4">
                            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                                BloodBridge
                            </h2>
                            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
                        </div>

                        <p className="text-xl font-light leading-relaxed text-light-text dark:text-dark-text/70">
                            Every drop counts. Effortlessly connecting blood
                            donors with recipients, ensuring a transparent and
                            efficient blood donation network.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 -mt-24 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(
                        ({ icon: Icon, label, value, suffix, color }) => (
                            <Card
                                key={label}
                                className="p-8 border-0 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                <div className="text-center space-y-4">
                                    <div className="inline-flex p-4 rounded-full bg-primary/5">
                                        <Icon
                                            className={`w-8 h-8 text-${color}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-4xl font-bold flex justify-center items-baseline">
                                            <NumberTicker value={value} />
                                            <span className="text-2xl ml-1">
                                                {suffix}
                                            </span>
                                        </div>
                                        <p className="text-light-text/80 dark:text-dark-text/80">
                                            {label}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )
                    )}
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-0 bg-gradient-to-br from-white to-light-bg dark:from-dark-bg dark:to-dark-bg/50"
                        >
                            <div className="space-y-6">
                                <div className="inline-flex p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="text-light-text/70 dark:text-dark-text/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};
