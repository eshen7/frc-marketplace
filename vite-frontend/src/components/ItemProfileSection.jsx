import React from "react";
import { FaComments } from "react-icons/fa";
import { haversine } from "../utils/utils";
import { useUser } from "../contexts/UserContext";
import ProfilePhoto from "./ProfilePhoto";

export default function ItemProfileSection({ user, isOwner, navigate }) {
  const { user: selfUser } = useUser();

  return (
    <>
      {/* User Stuff */}
      <div className='col-span-1 md:col-span-2 xl:col-span-1'>
        <div className='flex flex-row justify-between place-items-center'>
          <div className="flex flex-col">
            {/* Team Name */}
            <h2 className='text-[24px] text-left lg:text-left'>
              {user.team_number} | {user.team_name}
            </h2>
            <p className='text-sm'>
              {user.formatted_address.city}, {user.formatted_address.state}
            </p>
          </div>

          <div className='rounded-full p-1 bg-gray-300 mr-3 max-w-fit max-h-fit ml-2'>
            <ProfilePhoto
              src={user.profile_photo}
              teamNumber={user.team_number}
              alt={"Team Logo"}
              className='w-[64px] h-[64px] rounded-full' />
          </div>
        </div>
        {/* Distance */}
        <div>
          <p className='text-sm'>
            {selfUser && !isOwner ? (
              `${haversine(
                user.formatted_address.latitude,
                user.formatted_address.longitude,
                selfUser.formatted_address.latitude,
                selfUser.formatted_address.longitude
              ).toFixed(1)} miles`
            ) : selfUser && isOwner ? (
              "Your Listing"
            ) : ("")}
          </p>
        </div>

        <div className='flex flex-col mt-3'>
          <button onClick={() => navigate(`/profile/frc/${user.team_number}`)} className='py-3 px-6 bg-black hover:bg-gray-800 transition duration-200 text-white rounded-md mb-4'>
            <div className='flex flex-row justify-center place-items-center'>
              <p>Profile Page</p>
            </div>
          </button>
          <button onClick={() => navigate(`/chat/${user.team_number}`)} className='py-3 px-6 bg-blue-700 hover:bg-blue-800 transition duration-200 text-white rounded-md'>
            <div className='flex flex-row justify-center place-items-center'>
              <FaComments className='mr-3' />
              <p>
                Message
              </p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}