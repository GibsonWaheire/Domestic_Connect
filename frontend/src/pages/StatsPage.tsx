import { Users, MapPin, Star, Zap } from 'lucide-react';

const StatsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-orange-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">Platform Stats</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
              <Users className="h-8 w-8 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Housegirls Available</div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
            <div className="text-gray-600 font-medium">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600 font-medium">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
            <div className="text-gray-600 font-medium">Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
