import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<p className="">
				googoo gaga bitch
			</p>
			<h1>FRC Marketplace</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.jsx</code> and save to test HMR
				</p>
			</div>
			<p>
				test test test test test test test test test test test
			</p>
		</>
	)
}

export default App
