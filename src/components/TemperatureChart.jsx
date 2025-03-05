import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const socket = io('http://localhost:3001');

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

function TemperatureChart() {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
        }],
    });
    const [records, setRecords] = useState([]);
    const [minutes, setMinutes] = useState(1);
    const [alertColor, setAlertColor] = useState('green');
    const [alertMessage, setAlertMessage] = useState('');
    const [threshold, setThreshold] = useState(30);

    useEffect(() => {
        socket.on('temperatureUpdate', ({ temperature, threshold }) => {
            setThreshold(threshold);
            const time = new Date();
            const formattedTime = time.toLocaleTimeString();

            setRecords(prev => [...prev, { time, temperature }]);

            setChartData((prevData) => {
                const newData = { ...prevData };
                newData.labels.push(formattedTime);
                newData.datasets[0].data.push(temperature);

                if (newData.labels.length > 10) {
                    newData.labels.shift();
                    newData.datasets[0].data.shift();
                }

                newData.options = {
                    plugins: {
                        annotation: {
                            annotations: {
                                thresholdLine: {
                                    type: 'line',
                                    yMin: threshold,
                                    yMax: threshold,
                                    borderColor: 'rgb(255, 0, 0)',
                                    borderWidth: 2,
                                    label: {
                                        enabled: true,
                                        content: `Umbral: ${threshold}°C`
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x:{
                            tricks: {
                                autoSkip: true,
                                maxTriksLimit:10,
                            }
                        },
                        y: {
                            beginAtZero: true,
                        }
                    }
                };

                if (temperature > threshold) {
                    setAlertMessage('⚠️ ¡Temperatura fuera del umbral!');
                    setAlertColor('red');
                } else if (temperature > threshold - 3) {
                    setAlertMessage('⚠️ Temperatura cercana al umbral.');
                    setAlertColor('orange');
                } else {
                    setAlertMessage('✅ Temperatura dentro del umbral.');
                    setAlertColor('green');
                }
                return newData;
            });
        });
        socket.on('coresUsage', (data) => console.log(data));
    }, []);

    const handleThresholdChange = (e) => {
        const newThreshold = parseFloat(e.target.value);
        setThreshold(newThreshold);
        socket.emit('setThreshold', newThreshold);
    };

    const downloadPDF = () => {
        const now = new Date();
        const requestedMinutes = parseInt(minutes);
        const requestedTimeAgo = new Date(now.getTime() - requestedMinutes * 60000);

        // Filtrar registros recientes
        let recentRecords = records.filter(record => record.time > requestedTimeAgo);

        // Eliminar duplicados por bloque de 5 segundos
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

        // Completar con "Sin datos" si faltan registros
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

        // Ordenar para que los más recientes estén arriba
        uniqueRecords.reverse();

        const doc = new jsPDF();
        doc.text(`Registros de Temperatura (últimos ${requestedMinutes} minutos)`, 14, 20);

        const tableData = uniqueRecords.map(record => [
            record.time.toLocaleTimeString(),
            record.temperature === 'Sin datos' ? 'Sin datos' : `${record.temperature.toFixed(2)}°C`
        ]);

        autoTable(doc, {
            head: [["Hora", "Temperatura"]],
            body: tableData,
            startY: 30,
        });

        doc.save(`temperaturas_${now.toLocaleTimeString()}.pdf`);
    };

    const downloadCSV = () => {
        if (records.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const csvHeader = "Hora,Temperatura\n";
        const csvRows = records.map(record => 
            `${record.time.toLocaleTimeString()},${record.temperature === 'Sin datos' ? 'Sin datos' : record.temperature.toFixed(2)}°C`
        );
        const csvContent = csvHeader + csvRows.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `temperaturas_${new Date().toLocaleTimeString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ width: '80%', maxWidth: '800px', margin: '50px auto', height: 'auto', textAlign: 'center' }}>
            <h1>Monitoreo de Temperatura</h1>
            {alertMessage && (
                <div style={{
                    padding: '15px',
                    marginBottom: '30px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '18px',
                    backgroundColor: alertColor
                }}>
                    {alertMessage}
                </div>
            )}
            <div style={{ height: '500px' }}>
                <Line id="temperature-chart" data={chartData} options={chartData.options} />
            </div>
            <div style={{ marginTop: '30px' }}>
                <label>Definir Umbral de Temperatura:</label>
                <input
                    type="number"
                    onChange={handleThresholdChange}
                    value={threshold}
                    style={{ marginLeft: '10px', width: '120px', padding: '8px' }}
                />
            </div>
            <div style={{ marginTop: '30px' }}>
                <label>Minutos a descargar:</label>
                <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    style={{ marginLeft: '10px', width: '120px', padding: '8px' }}
                />
            </div>
            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={downloadPDF}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
                >
                    Descargar PDF
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700"
                >
                    Descargar CSV
                </button>
            </div>
        </div>  
    );
}

export default TemperatureChart;

