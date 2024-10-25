import React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';

const TopBar = () => {
    return (
        <div className='bg-red-800 top-0 left-0 z-50 w-full'>
            <div className='max-w-none mx-auto px-2 sm:px-4 lg:px-6 min-w-80'>
                <div className='h-16 flex items-center justify-end'>
                    <Stack className="justify-center" direction="row" spacing={2}>
                        <Stack direction="row" spacing={2} className='px-6'>
                            <Button variant="contained" color='secondary'>Sign In</Button>
                            <Button variant="outlined" color='secondary'>Register</Button>
                        </Stack>
                        <IconButton className='items-center'>
                            <IosShareOutlinedIcon fontSize='medium' color='secondary'/>
                        </IconButton>
                        <IconButton className='items-center'>
                            <SettingsOutlinedIcon fontSize='medium' color='secondary'/>
                        </IconButton>
                        <IconButton className='items-center'>
                            <Person2OutlinedIcon fontSize='medium' color='secondary'/>
                        </IconButton>
                    </Stack>
                </div>
            </div>
        </div>
    );
}

export default TopBar