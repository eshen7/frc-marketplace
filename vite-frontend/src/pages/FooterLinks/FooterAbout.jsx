import React from "react";
import TopBar from "../../components/TopBar.jsx";
import Footer from "../../components/Footer.jsx";
import dinglebob from "../../assets/dinglebob.jpg";
import replaceasap from "../../assets/replaceasap.jpg";

const About = () => {
  console.log("footerabout page rendered succasessfullay");
  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-5 md:px-10 lg:px-20 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-blue-900 mb-8">
              About{" "}
              <span className="text-blue-600">Millennium Marketplace</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to Millennium Marketplace, your go-to platform for
              fostering collaboration and innovation within the FIRST Robotics
              community. Our mission is to empower teams, students, mentors, and
              enthusiasts by providing a centralized hub for sharing resources
              and connecting with others.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {/* 1st section */}
            <div className="flex flex-wrap items-center justify-between">
              <div className="w-full md:w-1/2 px-4">
                <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                  Who We Are
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Millennium Marketplace was created by passionate members of
                  the FIRST Robotics community who recognized the need for a
                  space where collaboration can thrive. Whether you are a rookie
                  team looking for parts or a seasoned team ready to pass on
                  spare equipment, this platform makes it easy for everyone to
                  connect and share resources.
                </p>
              </div>
              <div className="w-full md:w-1/2 px-4">
                <img
                  src={dinglebob}
                  alt="Who We Are"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/*2nd section */}
            <div className="flex flex-wrap items-center justify-between">
              <div className="w-full md:w-1/2 px-4 order-last md:order-first">
                <img
                  src={replaceasap}
                  alt="Our Goals"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full md:w-1/2 px-4">
                <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                  Our Goals
                </h2>
                <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                  <li>
                    <strong>Facilitate Connections:</strong> Provide a
                    user-friendly platform that helps teams easily find and
                    connect with others in the FIRST Robotics community.
                  </li>
                  <li>
                    <strong>Foster Collaboration:</strong> Enable teams to share
                    ideas, swap parts, and support each other in the spirit of
                    gracious professionalism.
                  </li>
                  <li>
                    <strong>Promote Sustainability:</strong> Encourage the reuse
                    and repurposing of parts, fostering an eco-friendly approach
                    to robotics and collaboration.
                  </li>
                </ul>
              </div>
            </div>

            {/*3rd scetion */}
            <div className="text-center">
              <h2 className="text-4xl font-semibold text-blue-900 mb-4">
                Join Us
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Millennium Marketplace thrives on the contributions of its
                community. Whether you are here to learn, share, or connect,
                we are excited to have you on board. Together, we can continue to
                inspire innovation and build a brighter future.
              </p>
              <div className="mt-8">
                {/*<button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all">
                Learn More
              </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
