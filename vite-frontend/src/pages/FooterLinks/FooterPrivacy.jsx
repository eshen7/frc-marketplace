import React from "react";
import TopBar from "../../components/TopBar.jsx";
import Footer from "../../components/Footer.jsx";

const PrivacyStatement = () => {
  console.log("Privacy Statement page rendered successfully");
  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-5 md:px-10 lg:px-20 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-blue-900 mb-8">
              Privacy <span className="text-blue-600">Statement</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Effective Date: January 10, 2024
            </p>
          </div>

          {/* intro section */}
          <div className="mt-16 space-y-8">
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Millennium Market is committed to protecting your privacy.
                This Privacy Statement explains how we collect, use, disclose,
                and safeguard your information when you visit our website
                (website url and site name). By using the site, you consent to
                the practices described in this Privacy Statement.
              </p>
            </section>

            {/* section 1 */}
            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                1. Information We Collect
              </h2>
              <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                1.1 Personal Information
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We may collect personal information that you provide directly to
                us, such as your name, email address, phone number, and other
                contact details when you:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>Sign up for our services.</li>
                <li>Fill out a form.</li>
                <li>Subscribe to our newsletter.</li>
                <li>Contact us directly.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-blue-800 mt-6 mb-2">
                1.2 Non-Personal Information
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We may automatically collect non-personal information about you,
                such as:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>Basic usage data to improve website functionality.</li>
                <li>Browser type and general device information.</li>
                <li>
                  Aggregate data about how users interact with the site (e.g.,
                  pages visited).
                </li>
                <li>Referring website addresses.</li>
              </ul>
            </section>

            {/* section 2 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>To provide, operate, and maintain our Site.</li>
                <li>To improve, personalize, and expand our Site.</li>
                <li>
                  To communicate with you, including responding to your
                  inquiries.
                </li>
                <li>
                  To send newsletters, marketing materials, or other information
                  you consent to receive.
                </li>
                <li>
                  To detect and prevent fraudulent or unauthorized activity.
                </li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            {/* section 3 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                3. Sharing Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, trade, or rent your personal information to
                others. However, we may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>
                  Service Providers: Third-Party vendors who help us operate our
                  Site and provide services (e.g., hosting providers, analytics
                  services).
                </li>
                <li>
                  Legal Obligations: When required by law or to respond to legal
                  processes.
                </li>
                <li>
                  Business Transfers: In the event of a merger, acquisition, or
                  sale of assets, your information may be transferred.
                </li>
              </ul>
            </section>

            {/* section 4 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your
                experience on our Site. Cookies are small files stored on your
                device that help us:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>Remember your preferences.</li>
                <li>Understand how you interact with our Site.</li>
                <li>Deliver personalized content.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings.
                Please note that disabling cookies may affect the functionality
                of our Site.
              </p>
            </section>

            {/* section 5 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement reasonable security measures to protect your
                information. However, no method of transmission over the
                internet or electronic storage is completely secure. While we
                strive to protect your data, we cannot guarantee its absolute
                security.
              </p>
            </section>

            {/* section 6 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>Access and obtain a copy of your data.</li>
                <li>Request correction or deletion of your information.</li>
                <li>Object to or restrict processing of your data.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                To exercise these rights, please contact us at
                millenniummarket.team@gmail.com
              </p>
            </section>

            {/* section 7 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                7. Third-Party Links
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our Site may contain links to third-party websites. We are not
                responsible for the privacy practices or content of those
                websites. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* section 8 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                8. Updates to This Privacy Statement
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Statement from time to time. Any
                changes will be posted on this page with an updated "Effective
                Date." We encourage you to review this Privacy Statement
                periodically.
              </p>
            </section>

            {/* section 9 */}

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Statement or our
                practices, please contact us at:
              </p>
              <address className="text-gray-600 leading-relaxed">
                <p>millenniummarket.team@gmail.com</p>
              </address>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyStatement;
