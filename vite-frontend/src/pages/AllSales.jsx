import React, { useState } from 'react'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

const salesItems = [
  { id: 1, title: "NEO Motor", team: "Team 2468", price: 50, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 2, title: "Falcon 500", team: "Team 1357", price: 75, condition: "broken", image: "/IMG_6769.jpg" },
  { id: 3, title: "Victor SPX", team: "Team 3690", price: 30, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 4, title: "PDP", team: "Team 9876", price: 60, condition: "ok", image: "/IMG_6769.jpg" },
  { id: 5, title: "Spark MAX", team: "Team 1234", price: 45, condition: "good", image: "/IMG_6769.jpg" },
  { id: 6, title: "Ultrasonic Sensor", team: "Team 5678", price: 25, condition: "poor", image: "/IMG_6769.jpg" },
  { id: 7, title: "Pneumatic Tubing", team: "Team 4321", price: 15, condition: "ok", image: "/IMG_6769.jpg" },
  { id: 8, title: "Joystick", team: "Team 8765", price: 35, condition: "bad", image: "/IMG_6769.jpg" },
  { id: 9, title: "Voltage Regulator", team: "Team 2109", price: 20, condition: "like-new", image: "/IMG_6769.jpg" },
  { id: 10, title: "Aluminum Extrusion", team: "Team 6543", price: 40, condition: "broken", image: "/IMG_6769.jpg" },
]

const SalesPage = () => {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('price')

  const filteredAndSortedItems = salesItems
    .filter(item => filter === 'all' || item.condition.toLowerCase() === filter)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      return a.title.localeCompare(b.title)
    })

  return (
    <>
    <TopBar />
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="text-red-800 p-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <select 
            className="bg-white text-red-800 px-2 py-1 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Conditions</option>
            <option value="like-new">Like New</option>
            <option value="good">Good</option>
            <option value="ok">Ok</option>
            <option value="poor">Poor</option>
            <option value="broken">Broken</option>
          </select>
          <select 
            className="bg-white text-red-800 px-2 py-1 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </header>
      <main className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-600 mb-1">{item.team}</p>
                <p className="text-green-600 font-bold mb-1">${item.price}</p>
                <p className="text-gray-600 mb-4">Condition: {item.condition}</p>
                <button className="bg-red-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full">
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
    <Footer />
    </>
  )
}

export default SalesPage;