import React from "react";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import { FaHandshake, FaUsers, FaMapMarkedAlt, FaRecycle, FaShieldAlt } from "react-icons/fa";
import { MdOutlineLocalShipping } from "react-icons/md";
import dinglebob from "../../assets/dinglebob.jpg";
import FIRST from "../../assets/FIRST.png";
import sustainabilityImage from "../../assets/walleSustainability.png"; // You'll need to add this image
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-blue-100 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const ValueCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
    <div className="text-3xl text-blue-500 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold text-white mb-8">
            About Millennium Market
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Every FRC team has faced the frustration of running out of critical parts at the worst possible time.
            That's why we created Millennium Market — a platform designed to help teams connect, share resources,
            and foster a sense of community.
          </p>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">
              Millennium Market was created by passionate members of the FIRST Robotics community
              who recognized the need for a space where collaboration can thrive. Whether you are
              a rookie team looking for parts or a seasoned team ready to pass on spare equipment,
              this platform makes it easy for everyone to connect and share resources.
            </p>
          </div>
          <div className="flex-1">
            <img src={dinglebob} alt="Who We Are" className="rounded-lg shadow-lg w-full" />
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard
            icon={<MdOutlineLocalShipping className="text-2xl text-blue-600" />}
            title="Request & Fulfill Parts"
            description="Post requests with need-by dates visible to nearby teams. Connect directly through our messaging system to coordinate exchanges and support other teams."
          />
          <FeatureCard
            icon={<FaMapMarkedAlt className="text-2xl text-blue-600" />}
            title="Interactive Team Map"
            description="Discover and connect with nearby teams through our interactive map. Build local relationships and strengthen the FRC community in your area."
          />
          <FeatureCard
            icon={<FaRecycle className="text-2xl text-blue-600" />}
            title="Post & Sell Spare Items"
            description="List extra parts, tools, or machines for sale. Our platform supports custom listings, helping teams find new homes for unused resources."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-2xl text-blue-600" />}
            title="Secure Accounts"
            description="Each team gets one verified account, typically managed by the head mentor. Our approval process ensures a trustworthy environment for all users."
          />
        </div>
      </div>

      {/* Sustainability Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex-1">
              <img src={sustainabilityImage} alt="Sustainability" className="rounded-lg shadow-lg w-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">Committed to Sustainability</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe in promoting sustainable practices within the FIRST community.
                By facilitating the reuse and sharing of parts between teams, we're helping
                reduce waste and environmental impact while fostering collaboration and
                resource efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FIRST Values Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">FIRST Values</h2>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed">
              <li><strong>Gracious Professionalism:</strong> Fostering respect, kindness, and high-quality work</li>
              <li><strong>Collaboration:</strong> Building stronger teams through resource sharing</li>
              <li><strong>Community Impact:</strong> Creating lasting connections between nearby teams</li>
            </ul>
          </div>
          <div className="flex-1">
            <img src={FIRST} alt="FIRST Values" className="rounded-lg shadow-lg w-full p-4 bg-white" />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of a collaborative community that empowers FRC teams to achieve more together!
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </div>

      <Footer />
    </div >
  );
};

export default About;
