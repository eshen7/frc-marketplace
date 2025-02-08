import React, { useState } from "react";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import { FaGithub, FaInstagram, FaEnvelope, FaCopy, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const ContactLink = ({ icon, label, value, href, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  const isEmail = label === "Email Us";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-3 bg-blue-100 rounded-full text-blue-600 text-xl">
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
        <p className="text-blue-600 break-all sm:break-normal">
          {value}
        </p>
      </div>
      {isEmail && (
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-full transition-colors mt-2 sm:mt-0 ${
            copied 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
          }`}
          title={copied ? "Copied!" : "Copy email"}
        >
          {copied ? <FaCheck /> : <FaCopy />}
        </motion.button>
      )}
    </motion.a>
  );
};

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <TopBar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600">
              Have questions or need support? Reach out to us through any of these channels.
            </p>
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <ContactLink
              icon={<FaEnvelope />}
              label="Email Us"
              value="millenniummarket.team@gmail.com"
              href="mailto:millenniummarket.team@gmail.com"
            />
            
            <ContactLink
              icon={<FaInstagram />}
              label="Follow on Instagram"
              value="@millenniummarkett"
              href="https://instagram.com/millenniummarkett"
            />
            
            <ContactLink
              icon={<FaGithub />}
              label="View Source Code"
              value="GitHub Repository"
              href="https://github.com/eshen7/frc-marketplace"
            />
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center text-gray-600">
            <p>
              We typically respond to emails within 24 hours during weekdays.
              For immediate updates, follow us on Instagram!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
