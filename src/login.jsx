import { useState } from 'react'; //manejar estados locales
import axios from 'axios'; //cliente para el backend
import { useNavigate, Link } from 'react-router-dom';
import './App.css';
import './index.css';//concto con estilos base y tailwind

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); //hook redireccion rutas

    // Función asincrona (importante uso del await) que maneja el envío del formulario de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password });
            alert(response.data.message);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);// Guarda el token recibido en localStorage
                navigate('/dashboard');
            }
        } catch (error) {
            alert('Error en el login ' + error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full" >
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                {/* Advertencia sobre envío de correos */}
                <p className="text-sm text-red-600 mb-4 text-center">
                    Al iniciar sesión, se enviarán correos de alerta si la temperatura supera el umbral.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 text-white cursor-pointer active:bg-blue-700">
                        Iniciar sesión
                    </button>
                </form>

                {/* Enlace a Registro */}
                <p className="mt-4 text-center">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}