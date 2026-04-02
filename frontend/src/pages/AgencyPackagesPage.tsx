import { Shield, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const packages = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1200,
    features: ['Verified worker', 'Basic training', '30-day replacement', 'Agency support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1500,
    features: ['Verified worker', 'Professional training', 'Background check', '60-day replacement'],
  },
  {
    id: 'international',
    name: 'International',
    price: 2000,
    features: ['Verified worker', 'International training', 'Comprehensive background check', '90-day replacement'],
  },
];

const AgencyPackagesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
      <Helmet>
        <title>Agency Packages & Pricing | Domestic Connect Kenya</title>
        <meta name="description" content="Choose a Domestic Connect Kenya agency package to list verified housegirls, nannies and caregivers. Affordable plans starting from KES 1,200. Reach thousands of Kenyan families." />
        <meta name="keywords" content="domestic worker agency packages kenya, housegirl agency nairobi pricing, domestic connect agency plan, hire domestic workers kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/agency-packages" />
        <meta property="og:title" content="Agency Packages & Pricing | Domestic Connect Kenya" />
        <meta property="og:description" content="Affordable agency packages to list and place verified domestic workers across Kenya." />
        <meta property="og:url" content="https://domestic-connect.co.ke/agency-packages" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agency Packages</h1>
          <p className="text-lg text-gray-600">Choose the package that best fits your hiring needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name} Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-gray-900">KES {pkg.price.toLocaleString()}</p>
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Select Package</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgencyPackagesPage;
