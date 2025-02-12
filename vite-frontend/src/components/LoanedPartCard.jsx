import React from "react";
import { motion } from "framer-motion";
import { FaBoxOpen, FaUserCircle, FaCalendarAlt } from "react-icons/fa";

const LoanedPartCard = ({ loan }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      <div className="flex gap-4">
        <div className="p-3 bg-green-100 rounded-full h-fit">
          <FaBoxOpen className="text-green-600 text-xl" />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-900">{loan.part.name}</h3>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUserCircle className="mr-2" />
              <span>Loaned to Team {loan.borrower_team.team_number}</span>
            </div>
            
            <div className="flex items-center text-gray-600 text-sm">
              <FaCalendarAlt className="mr-2" />
              <span>Return Date: {new Date(loan.return_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm
              ${loan.status === 'active' ? 'bg-green-100 text-green-800' : 
                loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'}`}
            >
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanedPartCard;