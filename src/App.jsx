import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TemperatureChart from './components/TemperatureChart';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './register';
import Login from './login';
import PropTypes from 'prop-types';
import './App.css';



const socket = io('http://localhost:3001');

// Ruta protegida (solo accesible si hay un token válido)
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
};

function App() {
    const [temperature, setTemperature] = useState(0);
    const [threshold, ] = useState(30);

    useEffect(() => {
        socket.on('temperatureUpdate', (data) => {
            setTemperature(data.temperature);
        });
        socket.on('coresUsage', (data)=> console.log(data));
    }, [threshold]);

    // Botón de Cerrar Sesión dentro del App
    const LogoutButton = () => {
        const navigate = useNavigate();

        const handleLogout = () => {
            localStorage.removeItem('token');  // Eliminar token de autenticación
            navigate('/');  // Redirigir al login
        };

        return (
            <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Cerrar Sesión
            </button>
        );
    };

    // Estructura de rutas 
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <div className="container mx-auto p-5 w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">Monitor de Temperatura</h1>
                                <LogoutButton />
                            </div>
                            <TemperatureChart temperature={temperature} />
                            <p className="text-lg text-center mt-5">
                                Temperatura actual: {temperature.toFixed(2)}°C
                            </p>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

export default App;