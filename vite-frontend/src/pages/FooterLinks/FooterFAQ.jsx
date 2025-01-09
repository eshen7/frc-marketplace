import React from "react";
import TopBar from "../../components/TopBar.jsx";
import Footer from "../../components/Footer.jsx";

const FAQPage = () => {
  console.log("FAQ page rendered successfully");
  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-5 md:px-10 lg:px-20 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-blue-900 mb-8">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h1>
          </div>

          {/* FAQ Content */}
          <div className="mt-16 space-y-8">
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Q. What is Millennium Marketplace?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Millennium Marketplace is a platform designed for robotics teams to buy, sell, or request specialized parts from other teams nearby. It helps streamline access to components during the build season.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Q. Who can use Millennium Marketplace?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Any robotics team, particularly those participating in FIRST Robotics Competition (FRC), can use the platform to collaborate and share resources.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Q. Is Millennium Marketplace free to use?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Yes, the platform is free to use for teams to list items or make requests. However, transactions for parts may involve costs determined by the seller.
              </p>
            </section>

            {/* Account & Profile Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Account & Profile
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I create an account?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. You can create an account using your team’s email address. Simply click “Sign Up” and follow the steps to complete your profile.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I update my profile information?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Log in, navigate to your profile page, and edit your details, including your team’s name, team number, and profile picture.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. What if I forget my password?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Click on “Forgot Password” on the login page and follow the instructions to reset your password.
              </p>
            </section>

            {/* Buying & Selling Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Buying & Selling
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I list a part for sale?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Go to the “Sell Parts” section, fill in the required information (e.g., part name, condition, price), and upload an image. Once submitted, your listing will appear on the marketplace.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I request a part?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Visit the “Request Parts” section, specify the part you need, and submit your request. Teams with matching parts will be notified.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Can I trade parts instead of selling or buying?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Yes! You can list parts as available for trade by setting the price to “Trade Only.”
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I contact another team about a listing?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Each listing has a “Message Seller” button. Clicking this will open a direct chat with the seller.
              </p>
            </section>

            {/* Messaging & Communication Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Messaging & Communication
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I send messages to other teams?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Use the Direct Messaging (DM) feature by clicking on the chat icon next to a team or listing. You can also view your active chats in the “Messages” section.
              </p>
            </section>

            {/* Safety & Security Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Safety & Security
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Is my team’s information safe on Millennium Marketplace?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Yes, we take your privacy seriously. Only essential team details, like your team name and number, are publicly visible. Sensitive data is securely stored.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How do I report inappropriate behavior?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. If you encounter any issues, you can report a user or message by clicking the “Report” button in their profile or chat.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Can I block another team?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Yes, blocking a team will prevent them from contacting you. You can manage blocked teams in your account settings.
              </p>
            </section>

            {/* Shipping & Logistics Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Shipping & Logistics
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. How does shipping work?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Shipping arrangements are managed directly between the buyer and seller. We recommend using reliable services and providing tracking information.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Can I specify local pickup instead of shipping?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Yes, you can arrange for local pickup through the chat feature when finalizing the transaction details.
              </p>
            </section>

            {/* Troubleshooting Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Troubleshooting
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Why isn’t my profile photo showing?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A. Ensure your profile photo URL is correctly formatted (e.g., https://www.thebluealliance.com/avatar/2024/frc3647.png). Update it in your profile settings.
              </p>

              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. What if I encounter a technical issue?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. If you experience a problem, contact our support team via the “Help” section or email us at millenniummarket.team@gmail.com.
              </p>
            </section>

            {/* Additional Questions Section */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Additional Questions
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                Q. Can I suggest new features for the platform?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. Absolutely! We welcome feedback. Send us your suggestions at millenniummarket.team@gmail.com!
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
