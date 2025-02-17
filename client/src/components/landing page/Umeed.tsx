import { ArrowUp } from "lucide-react";

export default function Umeed() {
    return (
        <section className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 bg-light-bg dark:bg-dark-bg">
                <div
                    className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"
                    style={{ backgroundSize: "120px 120px" }}
                ></div>

                {/* Top right decorative pattern */}
                <div
                    className="absolute top-0 right-0 w-full h-48 opacity-10"
                    style={{
                        background: `
              linear-gradient(135deg,
                transparent 20%,
                rgba(52, 152, 219, 0.08) 20%,
                rgba(52, 152, 219, 0.08) 40%,
                transparent 40%,
                transparent 60%,
                rgba(52, 152, 219, 0.08) 60%,
                rgba(52, 152, 219, 0.08) 80%,
                transparent 80%
              )
            `,
                        backgroundSize: "128px 128px",
                    }}
                />

                {/* Top left decorative pattern */}
                <div
                    className="absolute top-0 left-0 w-2/3 h-40 opacity-10"
                    style={{
                        background: `
              linear-gradient(45deg,
                rgba(52, 152, 219, 0.06) 25%,
                transparent 25%,
                transparent 50%,
                rgba(52, 152, 219, 0.06) 50%,
                rgba(52, 152, 219, 0.06) 75%,
                transparent 75%
              )
            `,
                        backgroundSize: "96px 96px",
                    }}
                />

                {/* Bottom left pattern */}
                <div
                    className="absolute bottom-0 left-0 w-full h-48 opacity-10 transform -rotate-3"
                    style={{
                        background: `
              linear-gradient(45deg,
                transparent 20%,
                rgba(52, 152, 219, 0.08) 20%,
                rgba(52, 152, 219, 0.08) 40%,
                transparent 40%,
                transparent 60%,
                rgba(52, 152, 219, 0.08) 60%,
                rgba(52, 152, 219, 0.08) 80%,
                transparent 80%
              )
            `,
                        backgroundSize: "128px 128px",
                    }}
                />

                {/* Bottom right pattern */}
                <div
                    className="absolute bottom-0 right-0 w-2/3 h-40 opacity-10 transform rotate-6"
                    style={{
                        background: `
              linear-gradient(-45deg,
                rgba(52, 152, 219, 0.06) 25%,
                transparent 25%,
                transparent 50%,
                rgba(52, 152, 219, 0.06) 50%,
                rgba(52, 152, 219, 0.06) 75%,
                transparent 75%
              )
            `,
                        backgroundSize: "96px 96px",
                    }}
                />
            </div>

            <div className="relative container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 backdrop-blur-sm">
                        <span className="text-sm font-medium text-secondary">
                            AI-Powered Medical Assistant
                        </span>
                    </span>

                    <div className="space-y-4">
                        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-secondary via-secondary/80 to-secondary bg-clip-text text-transparent">
                                Umeed
                            </span>
                        </h2>
                        <p className="text-sm text-light-text/70 dark:text-dark-text/70 italic">
                            Hope in every interaction
                        </p>
                        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-secondary/30 to-transparent rounded-full"></div>
                    </div>

                    <p className="text-xl font-light leading-relaxed text-light-text dark:text-dark-text/70">
                        Experience healthcare guidance reimagined through AI.
                        Share your symptoms, ask health-related questions, and
                        receive informative responses to help guide your
                        healthcare journey.
                    </p>

                    <div className="mt-8 bg-white dark:bg-dark-bg/80 rounded-xl shadow-lg p-6 border border-secondary/10">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm bg-secondary/10 text-light-text dark:text-dark-text/90">
                                    Fever
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-secondary/10 text-light-text dark:text-dark-text/90">
                                    Headache
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-secondary/10 text-light-text dark:text-dark-text/90 flex items-center gap-1">
                                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary/20">
                                        +
                                    </span>
                                    Add Symptom
                                </span>
                            </div>
                            <div className="border border-secondary/10 rounded-lg p-4 flex justify-between">
                                <p className="text-left text-sm text-light-text/70 dark:text-dark-text/70">
                                    Any message goes here...
                                </p>
                                <ArrowUp className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
