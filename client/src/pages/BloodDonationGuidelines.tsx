import { AlertTriangle, CheckCircle, Clock, Heart } from 'lucide-react';

const BloodDonationGuidelines = () => {
  return (
    <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <Heart size={48} className="animate-pulse" />
            <h1 className="text-4xl font-bold">Blood Donation Guidelines</h1>
          </div>
          <p className="mt-4 text-center text-xl">Your donation can save up to three lives!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-primary text-center">When You Cannot Donate Blood</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="transform rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-bg dark:shadow-primary/20">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="text-primary" />
                <h3 className="text-xl font-semibold dark:text-white">Temporary Conditions</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Cold, flu, or fever in the last week
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Recent surgery (within 6 months)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Pregnancy or recent childbirth (within 6 weeks)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Recent tattoo or piercing (within 4 months)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Low hemoglobin levels
                </li>
              </ul>
            </div>

            <div className="transform rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-bg dark:shadow-primary/20">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="text-primary" />
                <h3 className="text-xl font-semibold dark:text-white">Permanent Conditions</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Chronic illnesses like HIV, Hepatitis B, or Hepatitis C
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Heart conditions or severe hypertension
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Cancer or history of blood disorders
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Use of certain medications
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-3xl font-bold text-accent text-center">After Donation Care</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="transform rounded-lg bg-gradient-to-b from-white to-secondary/5 p-6 shadow-md transition-all hover:shadow-lg dark:from-dark-bg dark:to-secondary/20 dark:shadow-secondary/20">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="text-secondary" />
                <h3 className="text-xl font-semibold dark:text-white">Immediate Care</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-secondary">•</span>
                  Rest for 10-15 minutes after donation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-secondary">•</span>
                  Drink plenty of fluids
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-secondary">•</span>
                  Keep the bandage on for 4-5 hours
                </li>
              </ul>
            </div>

            <div className="transform rounded-lg bg-gradient-to-b from-white to-accent/5 p-6 shadow-md transition-all hover:shadow-lg dark:from-dark-bg dark:to-accent/20 dark:shadow-accent/20">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className="text-accent" />
                <h3 className="text-xl font-semibold dark:text-white">Next 24 Hours</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-accent">•</span>
                  Avoid heavy lifting and strenuous exercise
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-accent">•</span>
                  Eat iron-rich foods
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-accent">•</span>
                  Avoid alcohol consumption
                </li>
              </ul>
            </div>

            <div className="transform rounded-lg bg-gradient-to-b from-white to-primary/5 p-6 shadow-md transition-all hover:shadow-lg dark:from-dark-bg dark:to-primary/20 dark:shadow-primary/20">
              <div className="mb-4 flex items-center gap-2">
                <Heart className="text-primary" />
                <h3 className="text-xl font-semibold dark:text-white">Long-term Care</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Wait at least 56 days before next donation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Maintain a healthy diet
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Stay hydrated regularly
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BloodDonationGuidelines;