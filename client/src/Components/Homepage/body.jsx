import { useState, useEffect } from 'react';
import {
  CreditCard,
  Users,
  Calendar,
  Wallet,
  BarChart,
  ArrowUpRight,
  UserPlus,
  Receipt,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import logo from "../../../public/logo.png";
import s1 from "../../../public/hero_section/s1.png";
import s2 from "../../../public/hero_section/s2.png";
import s3 from "../../../public/hero_section/s3.png";
import s4 from "../../../public/hero_section/s4.png";
import Footer from './Footer';
import './body.css';

const HeroSection = () => {
  return (
    <div className="hero-main">
      <div className='w-full'>
        <div className="pt-8 lg:pt-0">
          <h1 className="text-4xl lg:text-6xl font-bold italic leading-tight drop-shadow-lg">
            Track your expenses.
          </h1>
          <h1 className="text-2xl lg:text-4xl font-bold italic mt-2 drop-shadow-md">
            Take control of your finances.
          </h1>
        </div>

        <div className="mt-6 space-y-2">
          <p className='text-lg lg:text-xl font-medium drop-shadow-sm'>
            A simple, intuitive way to manage your personal finances
          </p>
          <p className='text-lg lg:text-xl font-medium drop-shadow-sm'>
            and achieve your financial goals.
          </p>
        </div>

        <div className="text-center relative top-4">
          <button className="text-white text-xl me-4 cursor-pointer font-semibold bg-[#f15b42] py-3 px-8 rounded-lg hover:bg-[#e14a33] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started
          </button>
          <button className="text-[#f15b42] text-xl cursor-pointer font-semibold bg-white border-2 border-white py-3 px-8 rounded-lg hover:bg-transparent hover:text-white transition-all duration-300 shadow-lg">
            View Demo
          </button>
        </div>
      </div>

      <div className='hero-section-img-con'>
        <div className='flex gap-8'>
          <img src={s1} className='m-auto' alt="error" />
          <img src={s2} className='m-auto' alt="error" />
        </div>
        <div className='flex gap-8'>
          <img src={s3} className='m-auto' alt="error" />
          <img src={s4} className='m-auto' alt="error" />
        </div>
        <div className='hero-logo'>
          <img src={logo} alt="error" style={{animation:"spin 3s infinite"}} />
        </div>
      </div>
    </div>
  );
};


const KeyFeatures = () => {
  // Define our custom animations for the feature cards
  useEffect(() => {
    // Add the custom animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes scaleUp {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes scaleDown {
          0% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        .animate-scale-up {
          animation: scaleUp 0.5s forwards ease-in-out;
        }
        
        .animate-scale-down {
          animation: scaleDown 0.5s forwards ease-in-out;
        }
      `;
    document.head.appendChild(styleElement);

    // Clean up the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [activeFeature, setActiveFeature] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Features data
  const features = [
    {
      id: 1,
      title: "Personal Expense Management",
      icon: <CreditCard className="w-6 h-6" />,
      points: [
        "Track daily/monthly/yearly expenses",
        "Categorize spending by type",
        "Add notes and receipts to entries"
      ],
      color: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-500",
      angle: 270
    },
    {
      id: 2,
      title: "Group Expenses with Friends",
      icon: <Users className="w-6 h-6" />,
      points: [
        "Create and manage expense groups",
        "Add friends and split expenses easily",
        "Clear payer-payee visibility"
      ],
      color: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-500",
      angle: 342
    },
    {
      id: 3,
      title: "Recurring Expenses & Subscriptions",
      icon: <Calendar className="w-6 h-6" />,
      points: [
        "Set up recurring bills and payments",
        "Auto entry or timely reminders",
        "Pause or edit subscriptions anytime"
      ],
      color: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-500",
      angle: 50
    },
    {
      id: 4,
      title: "Savings Goal Tracker",
      icon: <Wallet className="w-6 h-6" />,
      points: [
        "Set personalized savings goals",
        "Visual progress tracking",
        "Smart budget suggestions"
      ],
      color: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-500",
      angle: 126
    },
    {
      id: 5,
      title: "Analytics & Payment Integration",
      icon: <BarChart className="w-6 h-6" />,
      points: [
        "Insightful charts & spending graphs",
        "Seamless Razorpay integration",
        "Detailed monthly reports"
      ],
      color: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
      iconColor: "text-fuchsia-500",
      angle: 190
    }
  ];

  const FeatureCard = ({ feature, active, onClick }) => {
    const radius = 280; // distance from center
    const [wasActive, setWasActive] = useState(false);
    const [animationClass, setAnimationClass] = useState("");

    // Track active state changes to apply appropriate animation classes
    useEffect(() => {
      if (active && !wasActive) {
        // Card becoming active - add scale-up animation
        setAnimationClass("animate-scale-up");
      } else if (!active && wasActive) {
        // Card becoming inactive - add scale-down animation
        setAnimationClass("animate-scale-down");
      }
      setWasActive(active);
    }, [active]);

    const x = radius * Math.cos((feature.angle * Math.PI) / 180);
    const y = radius * Math.sin((feature.angle * Math.PI) / 180);

    return (
      <div
        className={`absolute ${animationClass} ${active ? "z-30 shadow-lg" : "z-20 opacity-80"
          }`}
        style={{
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: `translate(-50%, -50%)`
        }}
      >
        <div
          className={`relative w-64 p-5 rounded-xl shadow-md cursor-pointer ${feature.color} 
                       border border-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
          onClick={() => onClick(feature.id)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${feature.iconColor} bg-white/80 dark:bg-gray-800/80`}>
              {feature.icon}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white">{feature.title}</h3>
          </div>

          <ul className="space-y-2">
            {feature.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <ArrowUpRight className="mt-0.5 text-white rounded-[50%] bg-[#C9DF8A] h-[1.2rem] w-[1.3rem]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => {
        if (prev === null) return 1;
        return prev % features.length + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container relative px-4 mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Key Features
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Everything you need to manage your finances in one place
          </p>
        </div>

        <div className="relative flex items-center justify-center h-[800px]">
          {/* Central Element */}
          <div className="absolute z-30 flex flex-col items-center justify-center w-48 h-48 transition-all duration-500 bg-white rounded-full shadow-2xl dark:bg-gray-800 animate-pulse-slow">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <img style={{ animation: 'spin 3s infinite' }} className="h-10" src="./logo.png" alt="error" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-bold">Plan. Track. Save.</p>
          </div>

          {/* Feature Cards */}
          <div className={`relative w-[30%] aspect-square transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                active={activeFeature === feature.id}
                onClick={setActiveFeature}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Sign Up & Set Up Your Profile",
      description: "Create your account, customize your profile, and connect your payment methods for a seamless experience.",
      icon: <UserPlus />,
      color: "bg-blue-50 dark:bg-blue-900/30",
      iconBg: "bg-blue-500",
      details: [
        "Simple email or social sign-up",
        "Customize expense categories",
        "Add payment methods"
      ]
    },
    {
      id: 2,
      title: "Add or Split Expenses",
      description: "Easily record personal expenses or split bills with friends for trips, dinners, or shared living costs.",
      icon: <Receipt />,
      color: "bg-purple-50 dark:bg-purple-900/30",
      iconBg: "bg-purple-500",
      details: [
        "Quick expense entry with photos",
        "Smart categorization",
        "Multiple currency support"
      ]
    },
    {
      id: 3,
      title: "Track Recurring & Group Expenses",
      description: "Manage subscriptions and bills. Create groups for roommates, trips, or projects to track shared expenses.",
      icon: <Calendar />,
      color: "bg-amber-50 dark:bg-amber-900/30",
      iconBg: "bg-amber-500",
      details: [
        "Subscription management",
        "Auto-reminders for bills",
        "Group expense tracking"
      ]
    },
    {
      id: 4,
      title: "Analyze, Save & Settle Payments",
      description: "Visualize spending patterns, set savings goals, and settle balances instantly with integrated Razorpay.",
      icon: <BarChart3 />,
      color: "bg-emerald-50 dark:bg-emerald-900/30",
      iconBg: "bg-emerald-500",
      details: [
        "Visual spending analytics",
        "Goal tracking dashboard",
        "One-click payments via Razorpay"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b  to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            TrackMyExpenses simplifies your financial life in just a few easy steps
          </p>
        </div>

        <div className="relative w-[80%] mx-auto">
          {/* Desktop connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300 dark:from-blue-500 dark:via-purple-500 dark:to-emerald-500 -translate-y-1/2 rounded-full opacity-70" />

          {/* Step cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={`h-full rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 ${step.color} 
                           transition-all duration-300 ${hoveredStep === step.id ? 'transform -translate-y-2 shadow-lg' : ''}`}
                >
                  {/* Step number with icon */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${step.iconBg} text-white shadow-lg
                                    transition-transform duration-300 ${hoveredStep === step.id ? 'scale-110' : ''}`}>
                        {step.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 
                                    flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white shadow-sm">
                        {step.id}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                    {step.description}
                  </p>

                  {/* Feature list appearing on hover */}
                  <div className={`space-y-2 transition-all duration-500 overflow-hidden ${hoveredStep === step.id ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'}`}>
                    <hr className="border-gray-200 dark:border-gray-600 my-4" />
                    <ul className="space-y-1">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <ArrowRight className="w-4 h-4 mt-0.5 text-white bg-[#0000009c] rounded-[50%] flex-shrink-0 cursor-pointer" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile & tablet connector arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-6">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center transform rotate-90">
                        <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop connector arrows */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 font-medium text-white  bg-gradient-to-r from-orange-400 to-pink-500  rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2" style={{ boxShadow: "0px 0px 15px -7px black" }}>
            Get Started
            <CreditCard className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export function Body() {
  return (
    <div className="h-[100vh]">
      <HeroSection />
      <KeyFeatures />
      <HowItWorks />
      <Footer />
    </div>
  );
}