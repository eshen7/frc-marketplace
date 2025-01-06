import React from 'react';

const SectionHeader = ({ title }) => {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h2 className="text-3xl font-bold text-[#3d4df4] w-fit">{title}</h2>
      <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-100 rounded-full flex-1"></div>
    </div>
  );
};

export default SectionHeader;
