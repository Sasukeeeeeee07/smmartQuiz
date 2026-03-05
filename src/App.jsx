import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminPanel from './pages/Admin'
import Quiz from './pages/Quiz'
import Login from './pages/Login'

// Guard: redirect to /login if not logged in
function PrivateRoute({ children }) {
    const user = sessionStorage.getItem('user')
    return user ? children : <Navigate to="/login" replace />
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    )
}

export default App
