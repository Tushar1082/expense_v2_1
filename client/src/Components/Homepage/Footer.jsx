import { useState, useEffect } from "react";
import {
      Facebook, 
  Instagram, 
  Github, 
  Linkedin, 
  Mail,
  Home,
  LayoutGrid,
  HelpCircle,
  Phone,
  Check
} from "lucide-react";

export default function Footer(){
  const [isVisible, setIsVisible] = useState(false);

  // For detecting when footer is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const footer = document.getElementById('app-footer');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) {
        observer.unobserve(footer);
      }
    };
  }, []);


  const navigationLinks = [
    { name: 'Home', href: '#', icon: <Home size={16} /> },
    { name: 'Features', href: '#features', icon: <LayoutGrid size={16} /> },
    { name: 'How It Works', href: '#how-it-works', icon: <HelpCircle size={16} /> },
    { name: 'Contact', href: '#contact', icon: <Phone size={16} /> },
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: <Facebook size={20} /> },
    { name: 'Instagram', href: 'https://instagram.com', icon: <Instagram size={20} /> },
    { name: 'GitHub', href: 'https://github.com', icon: <Github size={20} /> },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: <Linkedin size={20} /> },
  ];

  return (
    <footer 
      id="app-footer"
      className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-12 pb-6 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around mb-12">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-6">
              {/* App Logo */}
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src="./logo.png" alt="error" />
                  </div>
                </div>
              </div>
              <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                TrackMyExpenses
              </span>
            </div>
            <p className="text-sm mb-6" style={{color:'white'}}>
              Plan. Track. Save. 
              <span className="block mt-2">
                Your all-in-one expense tracking solution
              </span>
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4 mb-6 md:mb-0">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  className="text-white duration-300 transform hover:scale-110"
                  aria-label={social.name}
                  style={{color:'white'}}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Navigation */}
          <div >
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="hover:text-white flex items-center group transition-all duration-300"
                    style={{color:'white'}}
                  >
                    <span className="mr-2 text-gray-400 group-hover:text-orange-400">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>support@trackmyexpenses.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Finance Street</li>
              <li>San Francisco, CA 94103</li>
            </ul>
          </div>
          
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-6"></div>
        
        {/* Copyright */}
        <div className="text-center text-white text-sm">
          <p style={{color:'white'}}>&copy; {new Date().getFullYear()} TrackMyExpenses. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-white transition-colors duration-300" style={{color:'white'}}>Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors duration-300" style={{color:'white'}}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};