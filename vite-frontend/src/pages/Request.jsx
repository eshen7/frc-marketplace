import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Container,
    Box,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import TopBar from './../components/TopBar.jsx';
import Footer from '../components/Footer.jsx';
import axiosInstance from '../utils/axiosInstance';

const PartRequestForm = () => {
    const [parts, setParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [openNewPartDialog, setOpenNewPartDialog] = useState(false);
    const [newPartName, setNewPartName] = useState('');
    const [newPartDescription, setNewPartDescription] = useState('');

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            const response = await axiosInstance.get('/parts/');
            const data = response.data;
            setParts(data);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch parts');
        }
    };

    function getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post(
                '/requests/',
                {
                    part_id: selectedPart,
                    quantity: quantity
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    withCredentials: true
                }
            );
            setSuccess(true);
            setSelectedPart('');
            setQuantity(1);
        } catch (err) {
            console.error('Error response:', err);
            setError('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewPart = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post(
                '/parts/',
                {
                    name: newPartName,
                    description: newPartDescription
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            const newPart = response.data;
            setParts([...parts, newPart]);
            setSelectedPart(newPart.id);
            setOpenNewPartDialog(false);
            setNewPartName('');
            setNewPartDescription('');
            setSuccess(true);

        } catch (err) {
            setError('Failed to create part');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopBar />
            <Box sx={{ flexGrow: 1, mt: 4, mx: 'auto', width: '100%', maxWidth: 600, px: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Request a Part
                </Typography>
                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="part-select-label">Part</InputLabel>
                        <Select
                            labelId="part-select-label"
                            value={selectedPart}
                            onChange={(e) => setSelectedPart(e.target.value)}
                            required
                        >
                            {parts.map((part) => (
                                <MenuItem key={part.id} value={part.id}>
                                    {part.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ mt: 1, mb: 2 }}
                        onClick={() => setOpenNewPartDialog(true)}
                    >
                        Create New Part
                    </Button>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                        inputProps={{ min: 1 }}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                    </Button>
                </form>
                <Snackbar
                    open={success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(false)}
                    message="Operation completed successfully"
                />
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                    message={error}
                />
                {/* Dialog for creating a new part */}
                <Dialog open={openNewPartDialog} onClose={() => setOpenNewPartDialog(false)}>
                    <DialogTitle>Create New Part</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Part Name"
                            type="text"
                            fullWidth
                            value={newPartName}
                            onChange={(e) => setNewPartName(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={newPartDescription}
                            onChange={(e) => setNewPartDescription(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenNewPartDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateNewPart} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Footer />
        </Box>
    );
};

export default PartRequestForm;