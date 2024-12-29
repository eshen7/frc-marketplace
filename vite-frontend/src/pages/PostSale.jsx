import React, { useState, useEffect } from "react"
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material"
import TopBar from "../components/TopBar"
import Footer from "../components/Footer"
import SuccessBanner from "../components/SuccessBanner"
import ErrorBanner from "../components/ErrorBanner"
import NewPartForm from "../components/NewPartForm"
import axiosInstance from "../utils/axiosInstance"

const INITIAL_FORM_STATE = {
    partId: "",
    quantity: 1,
    price: "",
    condition: "",
    description: "",
}

const PartSaleForm = () => {
    const [parts, setParts] = useState([])
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [isNewPartFormOpen, setIsNewPartFormOpen] = useState(false)

    useEffect(() => {
        fetchParts()
    }, [])

    const fetchParts = async () => {
        try {
            const { data } = await axiosInstance.get("/parts/")
            setParts(data)
        } catch (error) {
            setError("Failed to fetch parts list")
            console.error("Error fetching parts:", error)
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log("part id", formData.partId)
        if (!formData.partId || !formData.condition) return

        setLoading(true)
        setError("")

        try {
            const saleData = {
                part_id: formData.partId,
                quantity: formData.quantity,
                ask_price: formData.price,
                condition: formData.condition,
                additional_info: formData.description,
            }

            console.log("sale data", saleData)

            await axiosInstance.post("/sales/", saleData)
            setSuccess(true)
            setFormData(INITIAL_FORM_STATE)
        } catch (error) {
            setError("Failed to submit sale listing. Please try again.")
            console.error("Error submitting sale listing:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewPartSuccess = (newPart) => {
        fetchParts()
        setFormData((prev) => ({ ...prev, partId: newPart.id }))
    }

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {success && (
                <SuccessBanner
                    message="Part listed for sale successfully!"
                    onClose={() => setSuccess(false)}
                />
            )}
            {error && <ErrorBanner message={error} onClose={() => setError("")} />}

            <TopBar />

            <Box sx={{ flexGrow: 1, maxWidth: 600, mx: "auto", px: 2, py: 4 }}>
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: "4rem",
                        textAlign: "center",
                        mt: "80px",
                        mb: "80px",
                        fontFamily: "Paytone One, sans-serif",
                        color: "#AE0000",
                        fontWeight: 800,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    Post a Sale
                </Typography>

                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="part-select-label">Part</InputLabel>
                        <Select
                            labelId="part-select-label"
                            name="partId"
                            value={formData.partId}
                            onChange={handleInputChange}
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
                        onClick={() => setIsNewPartFormOpen(true)}
                    >
                        Create New Part
                    </Button>
                    <TextField
                        fullWidth
                        name="quantity"
                        type="number"
                        margin="normal"
                        label="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        fullWidth
                        name="price"
                        type="number"
                        margin="normal"
                        label="Desired Price Per Unit"
                        value={formData.price}
                        onChange={handleInputChange}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="condition-select-label">Condition*</InputLabel>
                        <Select
                            labelId="condition-select-label"
                            name="condition"
                            value={formData.condition}
                            onChange={handleInputChange}
                            required
                        >
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="like-new">Like New</MenuItem>
                            <MenuItem value="good">Good</MenuItem>
                            <MenuItem value="fair">Fair</MenuItem>
                            <MenuItem value="poor">Poor</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        name="description"
                        label="Additional Info"
                        multiline
                        rows={4}
                        value={formData.description}
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
                        {loading ? <CircularProgress size={24} /> : "List Part for Sale"}
                    </Button>
                </form>

                <NewPartForm
                    open={isNewPartFormOpen}
                    onClose={() => setIsNewPartFormOpen(false)}
                    onSuccess={handleNewPartSuccess}
                    loading={loading}
                />
            </Box>

            <Footer />
        </Box>
    )
}

export default PartSaleForm

