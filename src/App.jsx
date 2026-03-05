import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminPanel from './pages/Admin'
import Quiz from './pages/Quiz'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Quiz />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    )
}

export default App
