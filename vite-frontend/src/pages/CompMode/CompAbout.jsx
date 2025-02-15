import React from "react";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import { FaRobot, FaHandshake, FaMapMarkedAlt, FaBell, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HelmetComp from "../../components/HelmetComp";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-purple-100 rounded-full mr-4">
        <Icon className="text-2xl text-purple-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const CompAbout = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <HelmetComp title="About Competition Mode" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-8">
            Competition Mode
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            A dedicated space for teams to collaborate and share resources during FRC competitions,
            making parts management easier when it matters most.
          </p>
        </div>
      </div>

      {/* Purpose Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Why Competition Mode?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Competition mode was designed to address the unique challenges teams face during events.
            When every minute counts and you need a critical part, having a dedicated system to
            connect with other teams at your event can make all the difference.
          </p>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard
            icon={FaRobot}
            title="Event-Specific Requests"
            description="Create and view part requests specific to your competition, making it easy to find what you need from teams who are right there with you."
          />
          <FeatureCard
            icon={FaUsers}
            title="Team Presence"
            description="See which teams are at your event and what parts they have available, facilitating quick connections when time is critical."
          />
          <FeatureCard
            icon={FaBell}
            title="Real-Time Updates"
            description="Receive instant notifications when teams at your event post new requests or respond to yours, ensuring you never miss an opportunity to help or get help."
          />
          <FeatureCard
            icon={FaHandshake}
            title="Quick Returns"
            description="Track borrowed parts with our built-in return system, making sure everything gets back to its rightful owner before teams head home."
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2 text-purple-600">1. Select Your Event</h3>
            <p>Choose the competition you're attending from our comprehensive list of FRC events.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2 text-purple-600">2. Post or Browse Requests</h3>
            <p>Create requests for parts you need or browse requests from other teams at your event.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2 text-purple-600">3. Connect and Share</h3>
            <p>Use our messaging system to coordinate part exchanges with other teams.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2 text-purple-600">4. Track and Return</h3>
            <p>Keep track of borrowed parts and manage returns all in one place.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join teams already using Competition Mode to make their events run smoother.
          </p>
          <button
            onClick={() => navigate("/comp")}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition-all"
          >
            Launch Competition Mode
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompAbout;
