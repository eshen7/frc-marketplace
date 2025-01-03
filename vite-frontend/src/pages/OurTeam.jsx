import React from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

const CreatorCard = ({ image, name, title, description, linkedin, insta }) => {
  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-center place-items-center">
        {/* Image */}
        <div className="border-black min-w-[100px]">
          <img src={image} className="rounded-full" width={100} />
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
          <h1 className="text-[40px] font-[500]">Our team</h1>
          <p className="mt-5">
            Sample description about the website and the dev team.
          </p>
        </div>

        {/* Creator Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          <CreatorCard
            name={"Eric Grun"}
            image={"/grun.jpeg"}
            title={"CS @ Rice"}
            description={
              "I'm an undergraduate at Rice University studying Computer Science and Entrepreneurship. " +
              "I was the president of Team 3647 from 2023-2024."
            }
            linkedin={"https://www.linkedin.com/in/ericg4"}
            insta={"https://www.instagram.com/eric.g4/"}
          />
          <CreatorCard
            name={"Edison Shen"}
            image={"/edward.jpg"}
            title={"CS @ Michigan"}
            description={"I'm an undergraduate at the University of Michigan, Ann Arbor studying Computer Science. " +
              "I was the software lead of Team 3647 from 2023-2024."}
            linkedin={"https://www.linkedin.com/in/edison-shen7/"}
            insta={"https://www.instagram.com/edisonshen91/"}
          />
          <CreatorCard
            name={"Andrew Chen"}
            image={"/IMG_6769.jpg"}
            title={"bigback"}
            description={"eater"}
            linkedin={"https://www.linkedin.com/in/ericg4"}
            insta={"https://www.instagram.com/eric.g4/"}
          />
          <CreatorCard
            name={"Ethan Lemke"}
            image={"/IMG_6769.jpg"}
            title={"bigback"}
            description={"eater"}
            linkedin={"https://www.linkedin.com/in/ericg4"}
            insta={"https://www.instagram.com/eric.g4/"}
          />
          <CreatorCard
            name={"Alexus Lee"}
            image={"/IMG_6769.jpg"}
            title={"biggest back"}
            description={"eater"}
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