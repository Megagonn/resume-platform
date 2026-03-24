// import { Moon, Sun, FileText } from 'lucide-react';
// import { useDarkMode } from '../hooks/useDarkMode';

// export default function Header() {
//   const { isDark, toggle } = useDarkMode();

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-brown-200 bg-chocolate-50/80 backdrop-blur-md transition-colors duration-300 dark:border-brown-800 dark:bg-brown-900/80">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center gap-2">
//           <FileText className="h-8 w-8 text-brown-600 dark:text-chocolate-300" />
//           <span className="text-xl font-bold text-brown-800 dark:text-chocolate-100">
//             Resume<span className="text-brown-600 dark:text-chocolate-400">Pro</span>
//           </span>
//         </div>
        
//         <nav className="hidden md:flex items-center gap-8">
//           <a href="#features" className="text-sm font-medium text-brown-700 hover:text-brown-900 dark:text-chocolate-300 dark:hover:text-chocolate-100 transition-colors">
//             Features
//           </a>
//           <a href="#pricing" className="text-sm font-medium text-brown-700 hover:text-brown-900 dark:text-chocolate-300 dark:hover:text-chocolate-100 transition-colors">
//             Pricing
//           </a>
//           <a href="#about" className="text-sm font-medium text-brown-700 hover:text-brown-900 dark:text-chocolate-300 dark:hover:text-chocolate-100 transition-colors">
//             About
//           </a>
//         </nav>

//         <div className="flex items-center gap-4">
//           <button
//             onClick={toggle}
//             className="rounded-full p-2 text-brown-700 hover:bg-brown-200 dark:text-chocolate-300 dark:hover:bg-brown-800 transition-colors"
//             aria-label="Toggle dark mode"
//           >
//             {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//           </button>
//           <button className="hidden sm:inline-flex rounded-full bg-brown-600 px-4 py-2 text-sm font-medium text-white hover:bg-brown-700 dark:bg-chocolate-600 dark:hover:bg-chocolate-700 transition-colors">
//             Get Started
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }