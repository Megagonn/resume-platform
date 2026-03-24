import React from 'react';

interface HeroProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ darkMode, setDarkMode }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-white">R</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary dark:text-primary-300">
                  The Ready Brand
                </h1>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              <span className="block mb-2">Revamp,</span>
              <span className="block mb-2">
                Rewrite <span className="italic text-primary dark:text-primary-300">&</span>
              </span>
              <span className="block">Repackage</span>
            </h2>
            
            <p className="text-3xl md:text-4xl font-light text-primary dark:text-primary-300 italic">
              Your CV
            </p>

            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-8">
              Make it very professional and outstanding touch
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get your ATS CV, Resume, and cover letter done today.
            </p>

            <div className="pt-8">
              <a
                href="#packages"
                className="inline-block btn-primary text-lg"
              >
                View Our Packages
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
};

export default Hero;