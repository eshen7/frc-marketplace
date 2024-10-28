import React from 'react'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

// Helper function to calculate days until due date
const getDaysUntil = (dueDate) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

// Mock data for requests
const allRequests = [
    { id: 1, title: "CIM Motor", team: { number: 1234, name: "Robo Wizards" }, distance: 2, dueDate: new Date(2024, 10, 30), coverPhoto: "" },
    { id: 2, title: "Pneumatic Cylinder", team: { number: 5678, name: "Tech Titans" }, distance: 5, dueDate: new Date(2024, 10, 28), coverPhoto: "" },
    { id: 3, title: "Talon SRX", team: { number: 9101, name: "Gear Guardians" }, distance: 10, dueDate: new Date(2024, 10, 27), coverPhoto: "" },
    { id: 4, title: "Encoder", team: { number: 2468, name: "Binary Builders" }, distance: 15, dueDate: new Date(2024, 11, 5), coverPhoto: "" },
    { id: 5, title: "Battery", team: { number: 1357, name: "Power Pioneers" }, distance: 8, dueDate: new Date(2024, 11, 2), coverPhoto: "" },
    { id: 6, title: "Wheels", team: { number: 3690, name: "Rolling Rangers" }, distance: 12, dueDate: new Date(2024, 11, 10), coverPhoto: "" },
    { id: 7, title: "Gearbox", team: { number: 4812, name: "Torque Troopers" }, distance: 18, dueDate: new Date(2024, 11, 15), coverPhoto: "" },
    { id: 8, title: "Camera", team: { number: 7531, name: "Vision Voyagers" }, distance: 7, dueDate: new Date(2024, 11, 8), coverPhoto: "" },
    { id: 9, title: "Servo Motor", team: { number: 9876, name: "Precision Pilots" }, distance: 3, dueDate: new Date(2024, 10, 29), coverPhoto: "" },
    { id: 10, title: "Limit Switch", team: { number: 2345, name: "Sensor Squad" }, distance: 20, dueDate: new Date(2024, 11, 20), coverPhoto: "" },
]

export default function AllRequests() {
    return (
        <>
            <TopBar />
            <div className="min-h-screen bg-gray-100 font-sans">
                <header className="bg-blue-600 text-white p-4 flex items-center">
                    <Link href="/" className="text-white mr-4 hover:underline">
                        ← Back
                    </Link>
                    <h1 className="text-2xl font-bold">All Part Requests</h1>
                </header>
                <main className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allRequests.map((request) => {
                            const daysUntil = getDaysUntil(request.dueDate)
                            const isUrgent = daysUntil < 3
                            return (
                                <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <img
                                        src={request.coverPhoto}
                                        alt={request.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                                        <p className="text-gray-600 mb-1">
                                            Team {request.team.number} - {request.team.name}
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            {request.distance} miles away
                                        </p>
                                        <p className={`mb-4 ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                            Due: {request.dueDate.toLocaleDateString()} ({daysUntil} days)
                                        </p>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                            Offer Part
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </main>
            </div>
            <Footer />
        </>

    )
}