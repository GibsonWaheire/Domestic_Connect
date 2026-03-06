import { Search, Shield, CheckCircle } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to find your perfect housegirl.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl inline-block mb-6">
              <Search className="h-10 w-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Profiles</h3>
            <p className="text-gray-600">Use filters to find a match by role, location, and skills.</p>
          </div>
          <div className="text-center">
            <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl inline-block mb-6">
              <Shield className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unlock Contact</h3>
            <p className="text-gray-600">Pay KES 200 via M-Pesa to unlock contact details.</p>
          </div>
          <div className="text-center">
            <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Hire</h3>
            <p className="text-gray-600">Contact directly and proceed with your hiring process.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
