import React from "react";

import { Helmet } from "react-helmet";

export default function HelmetComp({ title, description, keywords }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description ? description : `Connect, 
      collaborate, and create with fellow robotics teams. Find the parts you need 
      or help others build their dreams.`} />
      <meta name="keywords" content={`FRC, Marketplace, Facebook Marketplace, 
        Ebay, Thriftybot, Rev, FIRST, FTC, FLL, VEX, WCP, Team 3647, 
        Millennium Falcons, Millennium Market, WestCoast Products, robotics, parts, 
        used robotics parts, used, second hand, shipping, delivery, local, network, 
        out of stock, inventory, community, collaboration, sharing, resources, 
        sustainability, eco-friendly, eco, green, recycle, reuse, reduce, 
        gracious professionalism, coopertition, competition, teams, students, 
        mentor, mentorship, engineering, design, build, programming, electrical, 
        CAD, 3D printing, manufacturing, machining, assembly, testing, connect, buy, 
        donate, sell, request, fulfill, post, listing, search, find, discover
        ${keywords ? ", " + keywords : ""}`} />

    </Helmet>
  );
}