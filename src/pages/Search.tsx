
import DashboardLayout from "@/components/layout/DashboardLayout";

const Search = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Module</h1>
        <p className="text-xl text-gray-600 mb-8">
          This search module is under development. Please check back soon.
        </p>
        <div className="flex justify-center">
          <a
            href="/dashboard"
            className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Search;
