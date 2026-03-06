import { Briefcase, Award, TrendingUp } from 'lucide-react';

const WhyChoosePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-orange-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Domestic Connect?</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A simple and reliable way to find trusted domestic workers.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6">
              <Briefcase className="h-10 w-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Housegirl Bureau</h3>
            <p className="text-gray-600">Find vetted workers without the usual stress and delay.</p>
          </div>
          <div className="text-center">
            <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6">
              <Award className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Hidden Fees</h3>
            <p className="text-gray-600">Transparent unlock pricing with no surprise charges.</p>
          </div>
          <div className="text-center">
            <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6">
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Growing Community</h3>
            <p className="text-gray-600">More families and workers join every day.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChoosePage;
