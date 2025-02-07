import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaListAlt, FaHandshake, FaComments, FaBoxOpen, FaShieldAlt, FaInfoCircle } from "react-icons/fa";

const GuidelineCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-300">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-blue-100 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const GuidelineSection = ({ title, image, children }) => (
  <div className="bg-white rounded-xl shadow-md p-8 mb-8">
    <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
      <FaInfoCircle className="text-blue-600" />
      {title}
    </h3>
    <div className="flex flex-wrap md:flex-nowrap gap-8">
      <div className="w-full md:w-1/2">
        <div className="bg-gray-100 rounded-lg p-4 mb-6 flex items-center justify-center min-h-[200px]">
          <img
            src={image}
            alt={`Example of ${title}`}
            className="max-w-full max-h-[300px] w-auto h-auto object-contain" /* Updated image styling */
          />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        {children}
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <TopBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Millennium Market</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Your registration is being processed. While you wait, learn about our platform's features and guidelines.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition-all"
            onClick={() => navigate("/footer/about")}
          >
            Learn About Us
          </motion.button>
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Guidelines</h2>
        
        <GuidelineSection title="Parts Standards" image="/PartImage.png">
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Specific Part Names</strong>
                Use exact manufacturer names and capitalize properly (e.g., "REV MAXPlanetary Gearbox")
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Include High Quality Photos</strong>
                When adding new parts to the database, provide clear images of the part
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Include Relevant Links</strong>
                Link to manufacturer product pages or documentation when possible
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Official Descriptions</strong>
                Copy the manufacturer's description for accuracy and completeness
              </div>
            </li>
          </ul>
        </GuidelineSection>

        <GuidelineSection title="Request Guidelines" image="/Request.png">
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Purpose Description</strong>
                Explain what you need the part for and why it's important
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Budget Information</strong>
                Specify your budget range and payment method
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Delivery Preferences</strong>
                Indicate if you prefer local pickup or shipping arrangements
              </div>
            </li>
          </ul>
        </GuidelineSection>

        <GuidelineSection title="Sales Guidelines" image="/Sale.png">
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Sale Reason</strong>
                Explain why you're selling (e.g., "Upgraded to newer version")
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Condition Details</strong>
                Describe current condition, usage history, and any modifications
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Delivery Options</strong>
                Specify shipping availability or local pickup requirements
              </div>
            </li>
          </ul>
        </GuidelineSection>

        <GuidelineSection title="Messaging Protocol" image="/Messaging.png">
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Security First</strong>
                Never share passwords, account details, or sensitive information
              </div>
            </li>
            <li className="flex items-start gap-2">
              <FaInfoCircle className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <strong className="block">Professional Conduct</strong>
                Maintain gracious professionalism in all communications
              </div>
            </li>
          </ul>
        </GuidelineSection>
      </div>

      {/* Next Steps Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">What's Next?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Once your registration is approved, you'll receive an email with login credentials. 
            You can then start participating in the marketplace and connecting with other teams.
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition-all border-2 border-blue-600"
              onClick={() => navigate("/footer/contact")}
            >
              Contact Support
            </motion.button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;