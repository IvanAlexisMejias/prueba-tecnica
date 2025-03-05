import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler, // Para gradientes
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PropTypes from 'prop-types';
import '../App.css';
import '../index.css';

// Colores futuristas
const NEON_CYAN = 'rgba(0, 255, 255, 0.8)';
const NEON_MAGENTA = 'rgba(255, 0, 255, 0.8)';
const DARK_BLUE = '#0A1F3D';
const GRADIENT_START = 'rgba(0, 191, 255, 0.2)';
const GRADIENT_END = 'rgba(0, 0, 0, 0)';

const socket = io('http://localhost:3001');

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler, // Registrar Filler para gradientes
);

function TemperatureChart({ temperature: initialTemperature, threshold: initialThreshold }) {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: NEON_CYAN,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, GRADIENT_START);
                gradient.addColorStop(1, GRADIENT_END);
                return gradient;
            },
            borderWidth: 3,
            pointBackgroundColor: NEON_MAGENTA,
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.4, // Líneas suaves y curvas
        }],
    });
    const [records, setRecords] = useState([]);
    const [actTemperature, setActTemperature] = useState(initialTemperature || 0);
    const [minutes, setMinutes] = useState(1);
    const [alertColor, setAlertColor] = useState('green');
    const [alertMessage, setAlertMessage] = useState('');
    const [threshold, setThreshold] = useState(initialThreshold || 30);

    useEffect(() => {
        socket.on('temperatureUpdate', ({ temperature, threshold }) => {
            setThreshold(threshold || initialThreshold || 30);
            setActTemperature(temperature || initialTemperature || 0);

            const time = new Date();
            const formattedTime = time.toLocaleTimeString();

            // Actualizar registros (evitar duplicados con la misma hora y temperatura)
            setRecords((prev) => {
                const lastRecord = prev[prev.length - 1];
                if (lastRecord && lastRecord.time.toLocaleTimeString() === formattedTime && lastRecord.temperature === temperature) {
                    return prev; // Skip if the data is the same as the last record
                }
                return [...prev, { time, temperature }];
            });

            // Actualizar los datos del gráfico con etiquetas únicas
            setChartData((prevData) => {
                const newData = { ...prevData };
                
                if (!newData.labels.includes(formattedTime)) {
                    newData.labels.push(formattedTime);
                    newData.datasets[0].data.push(temperature);
                } else {
                    const labelIndex = newData.labels.indexOf(formattedTime);
                    newData.datasets[0].data[labelIndex] = temperature;
                }

                if (newData.labels.length > 10) {
                    newData.labels.shift();
                    newData.datasets[0].data.shift();
                }

                newData.options = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false, // Ocultar leyenda para un look más limpio
                        },
                        annotation: {
                            annotations: {
                                thresholdLine: {
                                    zindex: 1,
                                    type: 'line',
                                    yMin: threshold,
                                    yMax: threshold,
                                    borderColor: 'rgba(255, 0, 0)',
                                    borderWidth: 2,
                                    //borderDash: [5, 5], // Línea punteada futurista
                                    label: {
                                        enabled: true,
                                        content: `Umbral: ${threshold}°C`,

                                    },
                                },
                            },
                        },
                        tooltip: {
                            backgroundColor: DARK_BLUE,
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: NEON_CYAN,
                            borderWidth: 2,
                            cornerRadius: 8,
                        },
                    },
                    scales: {
                        x: {
                            tricks: {
                                autoSkip: true,
                                maxTicksLimit: 10,
                                color: '#A0A0A0', // Texto gris claro para un look futurista
                                font: {
                                    family: 'Arial, sans-serif',
                                    size: 12,
                                    weight: 'bold',
                                },
                            },
                            grid: {
                                color: 'rgba(160, 160, 160, 0.2)', // Líneas de cuadrícula sutiles
                                borderColor: NEON_CYAN,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#A0A0A0',
                                font: {
                                    family: 'Arial, sans-serif',
                                    size: 12,
                                    weight: 'bold',
                                },
                                callback: (value) => `${value}°C`,
                            },
                            grid: {
                                color: 'rgba(160, 160, 160, 0.2)',
                                borderColor: NEON_CYAN,
                            },
                            title: {
                                display: true,
                                text: 'Temperatura (°C)',
                                color: '#FFFFFF',
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                    family: 'Arial, sans-serif',
                                },
                            },
                        },
                    },
                    animation: {
                        duration: 1000, // Animación suave al actualizar
                        easing: 'easeInOutCubic',
                    },
                };

                // Lógica de la alerta basada en temperatura vs el umbral
                if (temperature > threshold) {
                    setAlertMessage('⚠️ ¡Temperatura fuera del umbral!');
                    setAlertColor('#FF0000'); // Rojo neón
                } else if (temperature > threshold - 3) {
                    setAlertMessage('⚠️ Temperatura cercana al umbral.');
                    setAlertColor('#FFA500'); // Naranja neón
                } else {
                    setAlertMessage('✅ Temperatura dentro del umbral.');
                    setAlertColor('#00FF00'); // Verde neón
                }

                return newData;
            });
        });

        // Limpiar el listener al desmontar
        return () => {
            socket.off('temperatureUpdate');
        };
    }, [initialThreshold, initialTemperature]);

    const handleThresholdChange = (e) => {
        const newThreshold = parseFloat(e.target.value);
        setThreshold(newThreshold);
        socket.emit('setThreshold', newThreshold);
    };

    const downloadPDF = () => {
        if (records.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
    
        const now = new Date();
        const requestedMinutes = parseInt(minutes) || 1;
        const requestedTimeAgo = new Date(now.getTime() - requestedMinutes * 60000);
    
        let recentRecords = records.filter(record => record.time > requestedTimeAgo);
        recentRecords.sort((a, b) => a.time - b.time);
    
        const uniqueRecords = [];
        const seenTimestamps = new Set();
    
        for (const record of recentRecords) {
            const time = record.time;
            const key = `${time.getHours()}:${time.getMinutes()}:${Math.floor(time.getSeconds() / 5) * 5}`;
            if (!seenTimestamps.has(key)) {
                seenTimestamps.add(key);
                uniqueRecords.push(record);
            }
        }
    
        const expectedRecordsCount = requestedMinutes * (60 / 5);
        if (uniqueRecords.length < expectedRecordsCount) {
            alert("No hay suficientes datos para el rango solicitado. Completando con 'Sin datos'.");
            const missingCount = expectedRecordsCount - uniqueRecords.length;
            for (let i = 0; i < missingCount; i++) {
                uniqueRecords.push({
                    time: new Date(requestedTimeAgo.getTime() + i * 5000),
                    temperature: 'Sin datos'
                });
            }
        }
    
        uniqueRecords.sort((a, b) => b.time - a.time);
    
        try {
            const doc = new jsPDF();
            doc.setFillColor(0, 0, 0); // Fondo negro para un look futurista
            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
            doc.setTextColor(255, 255, 255); // Texto blanco
            doc.text(`Registros de Temperatura (últimos ${requestedMinutes} minutos)`, 14, 20);
    
            const tableData = uniqueRecords.map(record => [
                record.time.toLocaleTimeString(),
                record.temperature === 'Sin datos' ? 'Sin datos' : `${record.temperature.toFixed(2)}°C`
            ]);
    
            autoTable(doc, {
                head: [["Hora", "Temperatura"]],
                body: tableData,
                startY: 30,
                headStyles: { fillColor: [0, 0, 139], textColor: [255, 255, 255], fontSize: 12 },
                bodyStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 10 },
                alternateRowStyles: { fillColor: [0, 0, 50] },
            });
    
            doc.save(`temperaturas_${now.toLocaleTimeString().replace(/:/g, '-')}.pdf`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
        }
    };
    
    const downloadCSV = () => {
        if (records.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
    
        const now = new Date();
        const csvHeader = "Hora,Temperatura (°C)\n";
        const csvRows = records.map(record => {
            const time = `"${record.time.toLocaleTimeString().replace(/"/g, '""').replace(/,/g, '')}"`;
            const temp = record.temperature === 'Sin datos' 
                ? '"Sin datos"' 
                : record.temperature.toFixed(2).replace(/"/g, '""');
            return `${time},${temp}`;
        });
        const csvContent = csvHeader + csvRows.join("\n");
    
        try {
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
    
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `temperaturas_${now.toLocaleTimeString().replace(/:/g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error al generar el CSV:", error);
            alert("Hubo un error al generar el CSV. Revisa la consola para más detalles.");
        }
    };

    return (
        <div 
            style={{ 
                width: '90%', 
                maxWidth: '900px', 
                margin: '50px auto', 
                padding: '20px', 
                background: `linear-gradient(135deg, ${DARK_BLUE}, #1A2F5A)`, 
                borderRadius: '15px', 
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5), 0 0 20px ${NEON_CYAN}', 
                color: '#FFFFFF', 
                fontFamily: 'Arial, sans-serif' 
            }}
        >
            <h1 
                style={{ 
                    textAlign: 'center', 
                    fontSize: '2.5rem', 
                    color: NEON_CYAN, 
                    textShadow: '0 0 10px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}' 
                }}
            >
                Monitor de Temperatura
            </h1>
            {alertMessage && (
                <div 
                    style={{ 
                        padding: '15px', 
                        marginBottom: '30px', 
                        borderRadius: '10px', 
                        color: '#FFFFFF', 
                        fontSize: '1.2rem', 
                        backgroundColor: alertColor, 
                        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)' 
                    }}
                >
                    {alertMessage}
                </div>
            )}
            <div style={{ marginTop: '20px', fontSize: '1.2rem', color: NEON_CYAN, textShadow: '0 0 5px ${NEON_CYAN}' }}>
                Temperatura actual: {actTemperature.toFixed(2)}°C
            </div>
            <div style={{ marginTop: '30px' }}>
                <label style={{ fontSize: '1.1rem', color: '#A0A0A0' }}>
                    Definir Umbral de Temperatura:
                </label>
                <input
                    type="number"
                    onChange={handleThresholdChange}
                    value={threshold}
                    style={{ 
                        marginLeft: '10px', 
                        width: '120px', 
                        padding: '8px', 
                        borderRadius: '8px', 
                        border: `1px solid ${NEON_CYAN}`, 
                        background: '#1A2F5A', 
                        color: '#FFFFFF', 
                        boxShadow: '0 0 5px ${NEON_CYAN}' 
                    }}
                />
            </div>
            <div style={{ marginTop: '30px' }}>
                <label style={{ fontSize: '1.1rem', color: '#A0A0A0' }}>
                    Minutos a descargar:
                </label>
                <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    style={{ 
                        marginLeft: '10px', 
                        width: '120px', 
                        padding: '8px', 
                        borderRadius: '8px', 
                        border: `1px solid ${NEON_CYAN}`, 
                        background: '#1A2F5A', 
                        color: '#FFFFFF', 
                        boxShadow: '0 0 5px ${NEON_CYAN}' 
                    }}
                />
            </div>
            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={downloadPDF}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
                    style={{ 
                        borderRadius: '10px', 
                        boxShadow: '0 5px 15px rgba(0, 0, 255, 0.5), 0 0 10px ${NEON_CYAN}', 
                        transition: 'all 0.3s ease', 
                        fontSize: '1rem' 
                    }}
                >
                    Descargar PDF
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700"
                    style={{ 
                        borderRadius: '10px', 
                        boxShadow: '0 5px 15px rgba(0, 255, 0, 0.5), 0 0 10px ${NEON_CYAN}', 
                        transition: 'all 0.3s ease', 
                        fontSize: '1rem' 
                    }}
                >
                    Descargar CSV
                </button>
            </div>
            <div style={{ 
                height: '500px', 
                marginTop: '30px', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                background: `linear-gradient(135deg, ${DARK_BLUE}, #1A2F5A)`, 
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5), 0 0 20px ${NEON_CYAN}' 
            }}>
                <Line 
                    id="temperature-chart" 
                    data={chartData} 
                    options={chartData.options} 
                />
            </div>
        </div>  
    );
}

TemperatureChart.propTypes = {
    temperature: PropTypes.number,
    threshold: PropTypes.number,
};

export default TemperatureChart;