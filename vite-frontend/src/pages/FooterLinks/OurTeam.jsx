import React from "react";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";

const CreatorCard = ({ image, name, title, description, linkedin, insta }) => {
  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-center place-items-center">
        {/* Image */}
        <div className="border-black min-w-[100px]">
          <img src={image} className="rounded-full object-cover w-[100px] h-[100px]" />
        </div>

        {/* Logos & Links */}
        <div className="flex flex-row mt-2">
          {/* Linkedin */}
          <div className="pt-[1px] ">
            <a href={linkedin} target="_blank">
              <img src="/Linkedin.svg" width={20} />
            </a>
          </div>
          {/* Instagram */}
          <div className="ml-1">
            <a href={insta} target="_blank">
              <img src="/Insta.svg" width={30} />
            </a>
          </div>
          <div>

          </div>
        </div>
      </div>

      {/* Right Col */}
      <div className="flex flex-col ml-5">
        <h3 className="text-[15px] font-semibold">{name}</h3>
        <h4 className="text-[14px]">{title}</h4>
        <p className="mt-3 text-[13px]">{description}</p>
      </div>
    </div>
  );
};

export default function OurTeamPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-grow py-16 px-12 flex flex-col">
        {/* Title Section */}
        <div className="">
          <h1 className="text-[40px] font-[500]">Our Team</h1>
          <p className="mt-5">
            Created by FIRST alumni.
          </p>
        </div>

        {/* Creator Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          <CreatorCard
            name={"Eric Grun"}
            image={"/grun.jpeg"}
            title={"Fullstack dev - CS @ Rice"}
            description={"click my linkedin for free vbucks"}
            linkedin={"https://www.linkedin.com/in/ericg4"}
            insta={"https://www.instagram.com/eric.g4/"}
          />
          <CreatorCard
            name={"Edison Shen"}
            image={"/edward.jpg"}
            title={"CS @ Michigan"}
            description={"biggest bench in 3647 history"}
            linkedin={"https://www.linkedin.com/in/edison-shen7/"}
            insta={"https://www.instagram.com/edisonshen91/"}
          />
          <CreatorCard
            name={"Andrew Chen"}
            image={"/chen.jpeg"}
            title={"CS @ Wisconsin"}
            description={"Go badgers"}
            linkedin={"https://www.linkedin.com/in/andrewkkchen"}
            insta={"https://www.instagram.com/andrew._.chen/"}
          />
          <CreatorCard
            name={"Ethan Lemke"}
            image={"/ethanbutt.jpg"}
            title={"Fullstack Dev, 3647 Mentor"}
            description={"3647 alum"}
            linkedin={"https://www.linkedin.com/in/ethan-lemke-492838254/"}
            insta={"https://www.instagram.com/_ethanlemke_/"}
          />
          <CreatorCard
            name={"Alexus Lee"}
            image={"/Alexus.jpg"}
            title={"Design - Economics & Neuroscience @ Rice"}
            description={""}
            linkedin={"https://www.linkedin.com/in/alexus-lee-5b695a210/"}
            insta={"https://www.instagram.com/alexuss.27/"}
          />
        </div>

        {/* Bottom Portion */}
        <div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
