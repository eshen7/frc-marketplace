import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Material UI imports
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
// Date handling
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Components
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import SuccessBanner from '../components/SuccessBanner';
import ErrorBanner from '../components/ErrorBanner';
// Utils
import axiosInstance from '../utils/axiosInstance';

const INITIAL_FORM_STATE = {
  quantity: 1,
  neededFor: '',
  additionalInfo: '',
};

const NewPartDialog = ({ open, onClose, onCreate, loading }) => {
  const [partData, setPartData] = useState({ name: '', description: '' });

  const handleChange = (field) => (event) => {
    setPartData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    onCreate(partData);
    setPartData({ name: '', description: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Part</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Part Name"
          fullWidth
          value={partData.name}
          onChange={handleChange('name')}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={partData.description}
          onChange={handleChange('description')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NewPartDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const PartRequestForm = () => {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [dateNeeded, setDateNeeded] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isNewPartDialogOpen, setIsNewPartDialogOpen] = useState(false);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const { data } = await axiosInstance.get('/parts/');
      setParts(data);
    } catch (error) {
      setError('Failed to fetch parts list');
      console.error('Error fetching parts:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPart || !dateNeeded) return;

    setLoading(true);
    setError('');

    try {
      const requestData = {
        part_id: selectedPart,
        quantity: formData.quantity,
        needed_for: formData.neededFor,
        additional_info: formData.additionalInfo,
        needed_date: new Date(dateNeeded).toISOString().split('T')[0],
      };

      await axiosInstance.post('/requests/', requestData);
      setSuccess(true);
      setSelectedPart('');
      setFormData(INITIAL_FORM_STATE);
      setDateNeeded(null);
    } catch (error) {
      setError('Failed to submit request. Please try again.');
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePart = async (partData) => {
    setLoading(true);
    try {
      const { data: newPart } = await axiosInstance.post('/parts/', partData);
      setParts((prev) => [...prev, newPart]);
      setSelectedPart(newPart.id);
      setIsNewPartDialogOpen(false);
      setSuccess(true);
    } catch (error) {
      setError('Failed to create new part');
      console.error('Error creating part:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {success && (
        <SuccessBanner
          message="Operation completed successfully!"
          onClose={() => setSuccess(false)}
        />
      )}
      {error && <ErrorBanner message={error} onClose={() => setError('')} />}
      
      <TopBar />
      
      <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 'auto', px: 2, py: 4 }}>
        <h1 className="text-7xl text-center mt-[80px] mb-[80px] font-paytone text-[#AE0000] font-extrabold text-shadow-md">
          Make a Request
        </h1>
        
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
            onClick={() => setIsNewPartDialogOpen(true)}
          >
            Create New Part
          </Button>
          <TextField
            fullWidth
            name="quantity"
            margin="normal"
            label="Quantity*"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Need the part by*"
                value={dateNeeded}
                onChange={setDateNeeded}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              name="neededFor"
              label="Need it for what"
              value={formData.neededFor}
              onChange={handleInputChange}
            />
          </div>
          <TextField
            fullWidth
            name="additionalInfo"
            label="Any other additional info"
            multiline
            rows={4}
            value={formData.additionalInfo}
            onChange={handleInputChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 4 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Submit Request"}
          </Button>
        </form>

        <NewPartDialog
          open={isNewPartDialogOpen}
          onClose={() => setIsNewPartDialogOpen(false)}
          onCreate={handleCreatePart}
          loading={loading}
        />
      </Box>
      
      <Footer />
    </Box>
  );
};

export default PartRequestForm;
