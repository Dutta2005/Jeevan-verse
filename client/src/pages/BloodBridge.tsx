import RequestForm from "../components/blood bridge/RequestForm";
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "../components/ui/tabs";
import UserRequests from "../components/blood bridge/UserRequests";
import Requests from "../components/blood bridge/Requests";

function BloodBridge() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BloodBridge</h1>
          <p className="text-xl font-light max-w-2xl mx-auto">
          Your decision to donate blood can save up to three lives.
          </p>
        </div>
      </header>

      <main className="container mx-auto md:px-4 py-8">
        <Tabs defaultValue="donor" className="w-full px-1 max-w-4xl mx-auto">
          <TabsList className="flex justify-center space-x-2 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
            <TabsTrigger
              value="donor"
              className="flex-1 px-8 py-3 text-base font-semibold rounded-md data-[state=active]:bg-red-600 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Be a Donor
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex-1 px-8 py-3 text-base font-semibold rounded-md data-[state=active]:bg-red-600 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Blood Requests
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="bg-transparent rounded-lg shadow-lg py-8">
            <TabsContent value="donor" className="space-y-6">
              <RequestForm />
                <h2 className="text-center mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                  Become a Life Saver
                </h2>
                <Requests />
            </TabsContent>

            <TabsContent value="requests">
              <UserRequests />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

export default BloodBridge;
