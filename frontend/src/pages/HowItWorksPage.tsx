import { Search, Shield, CheckCircle, PhoneCall, Star, Clock, MapPin, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I find a housegirl on Domestic Connect Kenya?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Create a free account, browse verified domestic worker profiles filtered by location, role, and skills, then pay KES 200 via M-Pesa to unlock the contact details of any worker you want to hire."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to use Domestic Connect?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browsing profiles is completely free. You only pay KES 200 via M-Pesa when you want to unlock and see the contact details of a specific domestic worker. There are no monthly fees or hidden charges."
      }
    },
    {
      "@type": "Question",
      "name": "Are the domestic workers on Domestic Connect verified?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All domestic workers listed on Domestic Connect Kenya go through a registration and profile verification process. Workers provide their ID details, work history, skills, and references. Agencies on the platform are also vetted before listing their workers."
      }
    },
    {
      "@type": "Question",
      "name": "Which cities does Domestic Connect cover in Kenya?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Domestic Connect covers all major cities and towns in Kenya including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos, and many others. You can filter profiles by location to find workers near you."
      }
    },
    {
      "@type": "Question",
      "name": "What types of domestic workers can I find on Domestic Connect?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can find housegirls, nannies, babysitters, cooks, house managers, caregivers, elderly care assistants, cleaners, and house helps across Kenya on Domestic Connect."
      }
    }
  ]
};

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How It Works | Domestic Connect Kenya</title>
        <meta name="description" content="Learn how Domestic Connect Kenya works — browse verified housegirl, nanny and caregiver profiles, connect in minutes, and pay only KES 200 per contact." />
        <meta name="keywords" content="how domestic connect works, find housegirl kenya, hire nanny nairobi, domestic connect kenya process, how to find house help kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/how-it-works" />
        <meta property="og:title" content="How It Works | Domestic Connect Kenya" />
        <meta property="og:description" content="Simple steps to find your perfect housegirl, nanny or caregiver in Kenya. Browse free, pay only KES 200 to connect." />
        <meta property="og:url" content="https://domestic-connect.co.ke/how-it-works" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-pink-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How Domestic Connect Kenya Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Finding trusted house help in Kenya has never been easier. Domestic Connect connects families with verified housegirls, nannies, cooks, and caregivers across Kenya — all in three simple steps.
          </p>
        </div>
      </div>

      {/* 3 Steps */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Find Your Perfect House Help in 3 Steps</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl inline-block mb-6">
                <Search className="h-10 w-10 text-pink-600" />
              </div>
              <div className="text-3xl font-bold text-pink-500 mb-2">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Verified Profiles</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a free account and browse hundreds of verified domestic worker profiles. Filter by role (housegirl, nanny, cook, caregiver), location (Nairobi, Mombasa, Kisumu, Nakuru and more), age, experience, and skills. Each profile includes work history, a personal bio, and the worker's availability.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl inline-block mb-6">
                <Shield className="h-10 w-10 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-500 mb-2">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unlock Contact for KES 200</h3>
              <p className="text-gray-600 leading-relaxed">
                Once you find a domestic worker that fits your needs, pay KES 200 via M-Pesa to unlock their full contact details — including phone number. This one-time, affordable fee gives you direct access with no monthly subscription or hidden charges. Payment is fast, secure, and processed instantly through M-Pesa.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Hire Directly</h3>
              <p className="text-gray-600 leading-relaxed">
                Call or message the domestic worker directly and arrange an interview at your convenience. There are no middlemen — you deal directly with the worker or their agency. Agree on salary, duties, and start date on your own terms. Many families in Kenya find their ideal housegirl or nanny within 24 hours of joining.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">What Makes Domestic Connect Different</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Unlike traditional housegirl bureaus in Kenya that charge large placement fees, Domestic Connect Kenya gives you affordable, transparent access to verified domestic workers across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <PhoneCall className="h-8 w-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Direct Contact</h3>
              <p className="text-sm text-gray-600">No agency middlemen. Call the worker directly after unlocking their profile.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <Star className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Verified Workers</h3>
              <p className="text-sm text-gray-600">All domestic workers are registered and their profiles are reviewed before listing.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Available Now</h3>
              <p className="text-sm text-gray-600">Workers mark their availability so you only connect with those ready to start.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Nationwide Coverage</h3>
              <p className="text-sm text-gray-600">Find house help in Nairobi, Mombasa, Kisumu, Nakuru, Eldoret and beyond.</p>
            </div>
          </div>
        </div>
      </div>

      {/* For Workers */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Are You a Domestic Worker in Kenya?</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Domestic Connect also helps housegirls, nannies, cooks, and caregivers across Kenya find employment. Create your free profile and get discovered by hundreds of families looking for house help.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <Users className="h-8 w-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Register for Free</h3>
              <p className="text-sm text-gray-600">Create your profile for free. Add your skills, experience, and preferred location.</p>
            </div>
            <div className="p-6">
              <Star className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Get Found by Families</h3>
              <p className="text-sm text-gray-600">Employers across Kenya browse profiles daily looking for domestic workers like you.</p>
            </div>
            <div className="p-6">
              <PhoneCall className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Get Hired Directly</h3>
              <p className="text-sm text-gray-600">Employers contact you directly — no middleman taking a cut of your salary.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How do I find a housegirl on Domestic Connect Kenya?</h3>
              <p className="text-gray-600">Create a free account, browse verified domestic worker profiles filtered by location, role, and skills, then pay KES 200 via M-Pesa to unlock the contact details of any worker you want to hire.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How much does it cost to use Domestic Connect?</h3>
              <p className="text-gray-600">Browsing profiles is completely free. You only pay KES 200 via M-Pesa when you want to unlock and see the contact details of a specific domestic worker. There are no monthly fees or hidden charges.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Are the domestic workers on Domestic Connect verified?</h3>
              <p className="text-gray-600">Yes. All domestic workers on Domestic Connect Kenya go through a registration and profile verification process. Workers provide their ID details, work history, skills, and references. Agencies on the platform are vetted before listing their workers.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Which cities does Domestic Connect cover in Kenya?</h3>
              <p className="text-gray-600">Domestic Connect covers all major cities and towns in Kenya including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos, and many others. You can filter profiles by location to find workers near you.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What types of domestic workers can I find on Domestic Connect?</h3>
              <p className="text-gray-600">You can find housegirls, nannies, babysitters, cooks, house managers, caregivers, elderly care assistants, cleaners, and house helps across Kenya on Domestic Connect.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-pink-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect House Help?</h2>
          <p className="text-pink-100 mb-8">Join thousands of Kenyan families who have found trusted domestic workers through Domestic Connect. Browse free, pay only KES 200 to connect.</p>
          <Link
            to="/housegirls"
            className="inline-block bg-white text-pink-600 font-semibold px-8 py-3 rounded-full hover:bg-pink-50 transition-colors"
          >
            Browse Domestic Workers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
