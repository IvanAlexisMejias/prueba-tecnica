# 🚀 Manual Frontend del Sistema de Monitoreo de Temperatura en Tiempo Real

## 🏠 Descripción del Proyecto

Sistema que permite monitorear temperaturas en tiempo real, mostrando los datos en un gráfico dinámico mediante WebSocket. Incluye autenticación de usuarios con JWT, alertas visuales por umbral de temperatura, envío automático de correos y exportación de registros históricos en PDF.

⚠️ Importante:

- Primero debes registrarte y luego iniciar sesión.
- Llegarán correos al email con el que te registraste e iniciaste sesión si la temperatura supera el umbral.
- Para el correcto funcionamiento del frontend, es necesario tener el backend corriendo desde [https://github.com/IvanAlexisMejias/prueba-tecnica-backend](https://github.com/IvanAlexisMejias/prueba-tecnica-backend).

---

## 🛠️ Tecnologías Utilizadas

| Tecnología           | Descripción                                                |
| -------------------- | ---------------------------------------------------------- |
| **React**            | Biblioteca para construir interfaces de usuario dinámicas. |
| **Vite**             | Empaquetador rápido para desarrollo frontend.              |
| **TailwindCSS**      | Framework de estilos utilitarios para diseño responsivo.   |
| **axios**            | Cliente HTTP para comunicación con el backend.             |
| **socket.io-client** | Comunicación en tiempo real mediante WebSockets.           |
| **Chart.js**         | Librería para gráficos interactivos.                       |
| **react-chartjs-2**  | Adaptador para usar Chart.js en componentes React.         |
| **jspdf**            | Generación de archivos PDF.                                |
| **jspdf-autotable**  | Creación de tablas dentro de PDFs generados.               |
| **react-router-dom** | Gestión de rutas y navegación en React.                    |
| **PropTypes**        | Validación de tipos de propiedades (props).                |

---

## 🧩 Instalación del Frontend

### ✅ Requisitos:

- Node.js v16 o superior.
- npm (gestor de paquetes).
- Visual Studio Code (opcional).

### 🚀 Pasos:

1. Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

2. Accede a la carpeta del frontend:

```bash
cd frontend
```

3. Instala las dependencias:

```bash
npm install
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

5. Abre en tu navegador:

```
http://localhost:5173/
```

---

## 📦 Dependencias del `package.json`

### Dependencias principales:

```json
"dependencies": {
  "axios": "^1.6.2",
  "chart.js": "^4.4.0",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.5.33",
  "prop-types": "^15.8.1",
  "react": "^18.2.0",
  "react-chartjs-2": "^5.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "socket.io-client": "^4.7.5"
}
```

### Dependencias de desarrollo:

```json
"devDependencies": {
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32",
  "tailwindcss": "^3.4.1",
  "vite": "^4.4.11"
}
```

---

## 🔄 Flujo de Uso del Sistema

1️⃣ Registro de usuario (email y contraseña).\
2️⃣ Inicio de sesión (generación de token JWT válido por 1 hora).\
3️⃣ Acceso al Dashboard protegido (visualización del gráfico).\
4️⃣ Recepción de alertas visuales cuando la temperatura supera el umbral.\
5️⃣ Envío automático de correos al email registrado.\
6️⃣ Exportación del historial de temperaturas en PDF.

🔔 Nota: Los correos se enviarán al email con el que te registraste e iniciaste sesión.

---

## 🖥️ Funcionalidades Principales

- Autenticación y autorización con tokens JWT.
- Visualización de temperaturas en tiempo real mediante WebSockets.
- Alertas automáticas por temperatura alta.
- Exportación de registros históricos en PDF.
- Envío de correos electrónicos de alerta.
- Interfaz responsiva con TailwindCSS.
- Control de sesiones con token válido por 1 hora.

---

## 📧 Advertencias y Recomendaciones

- El token expira tras 1 hora; al expirar, es necesario iniciar sesión nuevamente.
- Si el backend no está activo, no se reciben actualizaciones.
- Solo recibirás correos si el backend está funcionando correctamente.
- Asegúrate de que el backend esté disponible en `http://localhost:3001/`.

---

## 📞 Soporte y Contacto

📧 Email: [ivan.mejiasm@gmail.com](mailto\:ivan.mejiasm@gmail.com)\
🔗 Repositorio: [https://github.com/IvanAlexisMejias/prueba-tecnica](https://github.com/IvanAlexisMejias/prueba-tecnica)


