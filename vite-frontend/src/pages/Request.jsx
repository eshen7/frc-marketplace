import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Button,
  IconButton
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';

const RequestPage = () => {
  const [formData, setFormData] = useState({
    requestName: '',
    partName: '',
    teamNumber: '',
    description: '',
    needBy: null,
    needFor: '',
    condition: '',
    willPayOrTrade: '',
    additionalInfo: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, needBy: date }));
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
    console.log(selectedFiles);
    // send data and files to backend
  };

  return (
    <div className='bg-gray-100 min-h-screen'>
      <TopBar />
      <h1 className="text-7xl text-center mt-[80px] mb-[80px] font-paytone text-[#AE0000] font-extrabold text-shadow-md">
        Make a Request
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <TextField
          fullWidth
          name="requestName"
          label="Name your request"
          value={formData.requestName}
          onChange={handleInputChange}
          margin="normal"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextField
            fullWidth
            name="partName"
            label="Name of Part"
            value={formData.partName}
            onChange={handleInputChange}
          />
          
          <TextField
            fullWidth
            name="teamNumber"
            label="Team #"
            value={formData.teamNumber}
            onChange={handleInputChange}
          />
        </div>

        <TextField
          fullWidth
          name="description"
          label="Short description / specifications"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          margin="normal"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Need the part by*"
              value={formData.needBy}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            name="needFor"
            label="Need it for what"
            value={formData.needFor}
            onChange={handleInputChange}
          />
        </div>

        <FormControl fullWidth margin="normal">
          <InputLabel>Condition of part*</InputLabel>
          <Select
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
          >
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Worn">Worn</MenuItem>
          </Select>
        </FormControl>

        <FormControl component="fieldset" margin="normal">
          <RadioGroup
            row
            name="willPayOrTrade"
            value={formData.willPayOrTrade}
            onChange={handleInputChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Willing to pay or trade" />
            <FormControlLabel value="no" control={<Radio />} label="Not willing to pay or trade" />
          </RadioGroup>
        </FormControl>

        <div className="mt-4">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span">
              Upload Images
            </Button>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Selected Images:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'white',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}

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
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          Submit Request
        </Button>
      </form>
    </div>
  );
};

export default RequestPage;