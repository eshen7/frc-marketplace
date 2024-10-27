import React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';


const TopBar = () => {
    return (
        <div className='bg-red-800 top-0 left-0 z-50 w-full shadow-lg'>
            <div className='max-w-none mx-auto px-2 sm:px-4 lg:px-6 min-w-80 grid grid-cols-2 items-center'>
                <a href="/"><img className="h-[40px] hover:cursor-pointer hover:scale-105 transition-translate duration-100" src="https://static.wixstatic.com/media/b46766_7bdb1070a7354b4393d1a759b3f81e71~mv2_d_1504_1860_s_2.png/v1/crop/x_8,y_0,w_1488,h_1860/fill/w_156,h_195,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/MillenniumFalconLogo3647.png" alt="3647 logo"></img></a>
                <div className='h-16 flex items-center justify-end'>
                    <Stack className="justify-center" direction="row" spacing={2}>
                        <Stack direction="row" spacing={2} className='px-6'>
                            <Button href="login" variant="contained" color='secondary' className='whitespace-nowrap'>Sign In</Button>
                            <Button href="signup" variant="outlined" color='secondary'>Register</Button>
                        </Stack>
                        <IconButton className='items-center'>
                            <IosShareOutlinedIcon fontSize='medium' color='secondary' />
                        </IconButton>
                        <IconButton className='items-center'>
                            <SettingsOutlinedIcon fontSize='medium' color='secondary' />
                        </IconButton>
                        <IconButton className='items-center'>
                            <Person2OutlinedIcon fontSize='medium' color='secondary' />
                        </IconButton>
                    </Stack>
                </div>
            </div>
        </div>
    );
}

export default TopBar