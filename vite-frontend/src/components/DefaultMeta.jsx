import React from "react";
import { Helmet } from "react-helmet";

const DefaultMeta = () => {
  return (
    <Helmet>
      <title>Millennium Marketplace</title>
      <meta
        name="description"
        content="Connect, collaborate, and create with fellow robotics teams. Find the parts you need or help others build their dreams."
      />
      <meta
        name="keywords"
        content="FRC, FIRST Robotics, Robotics, Parts, Market, Buy, Sell, Trade, Connect, Marketplace, Market, Donate"
      />
    </Helmet>
  );
};

export default DefaultMeta;