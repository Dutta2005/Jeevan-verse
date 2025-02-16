import PostCard from "../discussion/PostCard";
import { Marquee } from "../ui/marquee";

export default function ChitChat() {
    const discussionPosts1 = [
        {
            _id: "1",
            title: "Need help with fever symptoms",
            content:
                "I've had a fever for two days. Should I see a doctor or wait it out?",
            author: { name: "Amit" },
            createdAt: "2025-01-30T10:15:00Z",
            tags: ["help"],
        },
        {
            _id: "3",
            title: "Is intermittent fasting safe?",
            content:
                "I've been thinking about trying intermittent fasting. Is it safe for everyone?",
            author: { name: "Rahul" },
            createdAt: "2025-01-28T12:30:00Z",
            tags: ["question"],
        },
        {
            _id: "4",
            title: "Trouble sleeping at night",
            content:
                "Lately, I’ve been struggling with sleep. Any tips for better sleep?",
            author: { name: "Anonymous" },
            createdAt: "2025-01-24T22:30:00Z",
            tags: ["help"],
        },
    ];

    const discussionPosts2 = [
        {
            _id: "5",
            title: "Hydration tips for summer",
            content:
                "It's getting hotter, and I want to stay hydrated. Any tips?",
            author: { name: "Sneha" },
            createdAt: "2025-01-27T09:20:00Z",
            tags: ["discussion"],
        },
        {
            _id: "7",
            title: "How to reduce sugar cravings?",
            content:
                "I struggle with sugar cravings. Any natural ways to reduce them?",
            author: { name: "Meera" },
            createdAt: "2025-01-25T20:55:00Z",
            tags: ["advice"],
        },
    ];
    return (
        <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-dark-bg dark:to-dark-bg">
            <div className="container mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                        Community Space
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        Chit Chat
                    </h2>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-accent/50 to-transparent rounded-full"></div>
                    <p className="text-xl text-light-text/80 dark:text-dark-text/70 max-w-2xl mx-auto">
                        Share your thoughts and experiences on health, wellness,
                        and support—whether openly or anonymously.
                    </p>
                </div>

                <div className="relative -mx-4 md:mx-12 lg:mx-20">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent dark:from-dark-bg z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent dark:from-dark-bg z-10"></div>

                    <div className="relative overflow-hidden">
                        <Marquee className="py-4">
                            {discussionPosts1.map((post) => (
                                <div key={post._id} className="mx-4">
                                    <PostCard post={post} />
                                </div>
                            ))}
                        </Marquee>

                        <Marquee className="py-4" reverse>
                            {discussionPosts2.map((post) => (
                                <div key={post._id} className="mx-4">
                                    <PostCard post={post} />
                                </div>
                            ))}
                        </Marquee>
                    </div>
                    <p className="text-xl text-light-text/80 dark:text-dark-text/70 max-w-2xl mx-auto text-center mt-6">
                        Replies from doctors and medical students are
                        highlighted, ensuring credibility and helping you make
                        informed, trustworthy decisions.
                    </p>
                </div>
            </div>
        </section>
    );
}
