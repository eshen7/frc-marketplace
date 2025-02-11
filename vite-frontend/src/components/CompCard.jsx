import React from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaTrophy } from "react-icons/fa";
import { motion } from "framer-motion";

const CompCard = ({ comp }) => {
  const startDate = new Date(comp.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const endDate = new Date(comp.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden mb-4 hover:shadow-xl transition-all duration-300"
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 relative">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 pr-16 sm:pr-0">{comp.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
              <span className="truncate">{comp.city}, {comp.state_prov}</span>
            </div>
          </div>
          <div className="relative sm:static">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
              Week {comp.week + 1}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <div className="flex items-center text-gray-600">
            <FaCalendarAlt className="mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">{startDate} - {endDate}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaTrophy className="mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{comp.event_type_string}</span>
          </div>
        </div>

        {comp.website && (
          <div className="mt-4">
            <a
              href={comp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Visit Event Website
              <span className="ml-1">→</span>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CompCard;