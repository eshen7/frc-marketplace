import React from "react";
import TopBar from "../../components/TopBar.jsx";
import Footer from "../../components/Footer.jsx";

const TermsAndConditions = () => {
  console.log("Terms and Conditions page rendered successfully");
  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-5 md:px-10 lg:px-20 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-blue-900 mb-8">
              <span className="text-blue-600">Terms and Conditions</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Last Updated: January 10, 2024
            </p>
          </div>

          <div className="mt-16 space-y-8">
            <section>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Millennium Market. By accessing or using the
                Website, you agree to comply with and be bound by these Terms
                and Conditions. Please read these Terms carefully before
                navigating our Website. If you do not agree with any part of
                these Terms, please do not use our Website.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using the Website, you agree to comply with
                these Terms and confirm that you have the necessary
                authorization or consent to use this platform. These Terms
                constitute a legally binding agreement between you and
                Millennium Market.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                2. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to update or modify these Terms at any time
                without prior notice. The latest version will be posted on the
                Website, and your continued use of the Website after changes are
                posted constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                3. Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our Privacy Policy outlines how we collect, use, and protect
                your personal information. By using the Website, you agree to
                the terms of our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                4. User Conduct
              </h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                <li>Use the Website for lawful purposes only.</li>
                <li>
                  Do not post or transmit content that is harmful, abusive,
                  defamatory, or violates any third-party rights.
                </li>
                <li>
                  Do not attempt to gain unauthorized access to the Website, its
                  servers, or any associated systems.
                </li>
                <li>
                  Avoid using the Website in any manner that could disable,
                  overburden, or impair its functionality.
                </li>
                <p className="font-bold">
                  {" "}
                  We reserve the right to remove any parts request deemed
                  inappropriate, harmful, or offensive in any way.
                </p>
              </ul>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                5. Location Sharing and Visibility
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By using this service, you acknowledge and consent that your
                location may be visible to other users and may be displayed on
                the map. This information is shared in accordance with our
                service features and is intended for interaction with other
                users.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                6. Third-Party Links
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The Website may contain links to third-party websites or
                services. We are not responsible for the content, privacy
                practices, or terms of use of these third-party sites. Accessing
                them is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                7. Disclaimer of Warranties
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The Website is provided "as is" and "as available." We make no
                warranties, express or implied, regarding the Website’s
                functionality, availability, or content. To the fullest extent
                permitted by law, we disclaim all warranties, including but not
                limited to warranties of merchantability and fitness for a
                particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, we are not liable for
                any direct, indirect, incidental, consequential, or punitive
                damages arising from your use of or inability to use the
                Website, even if we have been advised of the possibility of such
                damages.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                9. Indemnification
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless Millennium Market,
                its affiliates, officers, directors, employees, and agents from
                any claims, damages, liabilities, or expenses arising out of
                your use of the Website or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                10. Termination
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your access to the
                Marketplace at our discretion, without notice, for any violation
                of these Terms or for other reasons deemed appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                11. Governing Law
              </h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms are governed by and construed in accordance with the
                laws of your jurisdiction. Any disputes arising from these Terms
                or your use of the Website will be subject to the exclusive
                jurisdiction of the courts in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                12. Contact Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                For any questions or concerns regarding these Terms, please
                contact us at:
              </p>
              <address className="text-gray-600 leading-relaxed">
                Millennium Market
                <br />
                millenniummarket.team@gmail.com
                <br />
              </address>
            </section>

            <section>
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                13. Miscellaneous
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If any provision of these Terms is found to be invalid or
                unenforceable, the remaining provisions will continue in full
                force and effect. Failure to enforce any right or provision of
                these Terms does not constitute a waiver of such right or
                provision.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
