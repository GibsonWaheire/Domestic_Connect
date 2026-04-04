import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Phone } from 'lucide-react';

const ContactUsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact Us | Domestic Connect Kenya</title>
        <meta name="description" content="Contact Domestic Connect Kenya support and sales for help with your account, housegirl listings, and agency services. We're here to help families and workers across Kenya." />
        <meta name="keywords" content="contact domestic connect kenya, domestic connect support, domestic connect nairobi contact" />
        <link rel="canonical" href="https://domestic-connect.co.ke/contact-us" />
        <meta property="og:title" content="Contact Us | Domestic Connect Kenya" />
        <meta property="og:description" content="Get in touch with Domestic Connect Kenya — we help families find verified house help and domestic workers find jobs across Kenya." />
        <meta property="og:url" content="https://domestic-connect.co.ke/contact-us" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us | Domestic Connect Kenya" />
        <meta name="twitter:description" content="Reach Domestic Connect Kenya for support with your account, listings, or agency services." />
      </Helmet>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center cursor-pointer"
          >
            <div className="p-2 bg-black rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black ml-3">Domestic Connect</h1>
          </button>
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="rounded-full"
          >
            Back Home
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-gray-600 mt-3">
            We are here to help with account support, agency onboarding, and partnership inquiries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-pink-600" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Best for account help and general questions.</p>
              <a
                href="mailto:info@domesticconnect.co.ke"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                info@domesticconnect.co.ke
              </a>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Phone className="h-5 w-5 text-pink-600" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Best for urgent agency and placement support.</p>
              <a href="tel:+254726899113" className="text-pink-600 hover:text-pink-700 font-medium">
                +254 726 899 113
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContactUsPage;
