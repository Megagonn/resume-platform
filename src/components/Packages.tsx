import React from 'react';

interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  sellaUrl: string;
}

const Packages: React.FC = () => {
  const packages: Package[] = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: '₦15,000',
      description: 'Perfect for entry-level professionals',
      features: [
        'Professional CV Rewrite',
        'ATS-Optimized Format',
        'Basic Cover Letter',
        '2 Revisions',
        '48-Hour Delivery'
      ],
      sellaUrl: 'https://sella.com.ng/hannah_cvwriter/basic-cv-package'
    },
    {
      id: 'standard',
      name: 'Standard Package',
      price: '₦25,000',
      description: 'For mid-level professionals seeking growth',
      popular: true,
      features: [
        'Premium CV Rewrite',
        'ATS-Optimized Format',
        'Customized Cover Letter',
        'LinkedIn Profile Optimization',
        'Unlimited Revisions',
        '24-Hour Delivery',
        'Email Support'
      ],
      sellaUrl: 'https://sella.com.ng/hannah_cvwriter/standard-cv-package'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: '₦40,000',
      description: 'Complete career package for executives',
      features: [
        'Executive CV Rewrite',
        'ATS-Optimized Format',
        'Multiple Cover Letters (3)',
        'LinkedIn Profile Optimization',
        'Resume Website',
        'Unlimited Revisions',
        '12-Hour Express Delivery',
        'Priority Support',
        '1-on-1 Consultation'
      ],
      sellaUrl: 'https://sella.com.ng/hannah_cvwriter/premium-cv-package'
    }
  ];

  const handlePackageClick = (sellaUrl: string) => {
    window.open(sellaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="packages" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Package
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your career goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative card cursor-pointer transform transition-all duration-300 hover:-translate-y-2 ${
                pkg.popular
                  ? 'ring-2 ring-primary dark:ring-primary-400 shadow-2xl scale-105'
                  : ''
              }`}
              onClick={() => handlePackageClick(pkg.sellaUrl)}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.name}
                </h3>
                <div className="text-4xl font-bold text-primary dark:text-primary-300 mb-2">
                  {pkg.price}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {pkg.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-primary dark:text-primary-300 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                  pkg.popular
                    ? 'bg-primary hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-900 dark:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePackageClick(pkg.sellaUrl);
                }}
              >
                Get Started →
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need something custom? 
            <a 
              href="https://wa.me/2347064641892" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary dark:text-primary-300 font-semibold hover:underline ml-2"
            >
              Contact us directly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Packages;