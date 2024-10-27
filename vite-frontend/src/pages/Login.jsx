import React from 'react';
import TopBar from './../components/TopBar.jsx';
import Container from '@mui/material/Container';
import { Box, Button } from '@mui/material';
import TextField from '@mui/material/TextField';


const Login = () => {
  return (
    <>
      <TopBar />
      <div className='flex justify-center bg-gray-100'>
        <div className='flex flex-col bg-gray-200 min-h-fit container my-20 justify-center w-2/3 mx-auto py-20 rounded-3xl min-w-96 shadow-xl'>
          <h1 className='text-5xl text-red-800 font-bold font-roboto text-center mb-32'>Sign in</h1>
          <div className='flex flex-col gap-5'>
            <div className="w-2/3 mx-auto"><TextField id="outlined-basic" label="Email" variant="outlined" className='w-full' /></div>
            <div className="w-2/3 mx-auto"><TextField id="outlined-basic" label="Password" variant="outlined" className='w-full' /></div>
            <div className='flex flex-row mx-10 justify-center'>
              <div className='w-1/2 flex justify-center'>
                <a href='signup' className='text-blue-600 hover:text-blue-800'>Sign Up Instead</a>
              </div>
              <div className='w-1/2 flex justify-center'>
                <Button variant="contained" className='justify-end w-1/2 whitespace-nowrap'>Sign in</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;