import { Calendar, Info, MapPin, Users } from "lucide-react";

const CampaignCard = ({
    title,
    description,
    icon: Icon,
    category,
    date,
    location,
}: any) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10"></div>
        <div className="relative p-8 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium px-4 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary">
                    {category}
                </span>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                {description}
            </p>

            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {date && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{date}</span>
                    </div>
                )}
                {location && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{location}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default function Campaign() {
    return (
        <section className="py-16 px-6 bg-gray-50 dark:bg-dark-bg">
            <div className="max-w-6xl mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <div className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        Active Campaigns
                    </div>
                    <h2 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">
                        Join Our Latest Initiatives
                    </h2>
                    <p className="text-lg text-light-text/70 dark:text-dark-text/70">
                        Connect with organizations and participate in campaigns
                        that make a real difference in your community's
                        healthcare.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <CampaignCard
                        title="Emergency Blood Drive"
                        description="Join our urgent blood donation camp. Your contribution can help save lives in critical situations. All blood types are welcome, especially O-negative and B-positive."
                        icon={Users}
                        category="Blood Drive"
                        date="February 15, 2025"
                        location="City General Hospital"
                    />

                    <CampaignCard
                        title="Community Health Awareness"
                        description="Learn about preventing seasonal diseases through our comprehensive awareness program. Get access to expert advice, free health checks, and educational resources."
                        icon={Info}
                        category="Health Education"
                        date="February 20, 2025"
                        location="Community Center"
                    />
                </div>
            </div>
        </section>
    );
}
