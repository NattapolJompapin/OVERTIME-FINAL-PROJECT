const express = require('express');
const app = express();
const cors = require('cors'); 
const mysql = require('mysql2/promise'); 

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Chizo1412Za@', // รหัสผ่านของคุณ
    database: 'BusStop',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors());
app.use(express.json());

app.post('/api/edge/report', async (req, res) => {
    const { Camera_ID, PassengerCount } = req.body;
    try {
        const sql = `
            INSERT INTO DensityCount (Camera_ID, PassengerCount, Timestamp)
            VALUES (?, ?, NOW())
        `;
        await db.query(sql, [Camera_ID, PassengerCount]);
        res.json({ status: "ok" });
    } catch (err) {
        console.error("EDGE ERROR:", err);
        res.status(500).json({ status: "error" });
    }
});

// --- API 1: ข้อมูลการ์ด ---
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const [busStopResults] = await db.query('SELECT COUNT(*) AS count FROM BusStop');
        res.json({
            capacity: `${busStopResults[0].count} Stops`, 
            revenue: "Active",    
            errors: 0,                
            followers: `+0`         
        });
    } catch (error) {
        console.error(error);
        res.json({ capacity: "Error", revenue: "Error", errors: 0, followers: 0 });
    }
});

// --- API 2: ข้อมูลกราฟ (ค่าเฉลี่ยราย 30 นาที แยกตามกล้อง CAM01-04) ---
app.get('/api/chart-data', async (req, res) => {
    try {
        const labels = [];
        for (let h = 7; h <= 22; h++) {
            const hour = h.toString().padStart(2, '0');
            labels.push(`${hour}:00`);
            if (h !== 22) labels.push(`${hour}:30`);
        }

        const sql = `
            SELECT 
                dc.Camera_ID,
                CONCAT(
                    DATE_FORMAT(dc.Timestamp, '%H'), ':', 
                    IF(MINUTE(dc.Timestamp) < 30, '00', '30')
                ) AS TimeSlot,
                ROUND(AVG(dc.PassengerCount), 0) AS AvgPeople
            FROM DensityCount dc
            WHERE dc.Camera_ID IN ('CAM01', 'CAM02', 'CAM03', 'CAM04')
              AND TIME(dc.Timestamp) BETWEEN '07:00:00' AND '22:00:00'
            GROUP BY dc.Camera_ID, TimeSlot
            ORDER BY TimeSlot ASC
        `;

        const [rows] = await db.query(sql);

        const getVal = (cameraId, timeLabel) => {
            const found = rows.find(r => r.Camera_ID === cameraId && r.TimeSlot === timeLabel);
            return found ? found.AvgPeople : 0;
        };

        const seriesData = [
            labels.map(t => getVal('CAM01', t)),
            labels.map(t => getVal('CAM02', t)),
            labels.map(t => getVal('CAM03', t)),
            labels.map(t => getVal('CAM04', t))
        ];

        res.json({
            labels: labels,
            series: seriesData
        });

    } catch (error) {
        console.error("Chart Error:", error);
        res.status(500).send("Error");
    }
});

// --- API 3: ข้อมูลตาราง ---
app.get('/api/table-data', async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.BusStop_ID as id, 
                b.Location_Name as stationName, 
                IFNULL(dc.PassengerCount, 0) as passengerCount,
                IF(dc.PassengerCount > 30, 'Crowded', 'Normal') as status,
                dc.Timestamp as timestamp
            FROM BusStop b
            LEFT JOIN Cameras c ON b.BusStop_ID = c.BusStop_ID
            LEFT JOIN (
                SELECT Camera_ID, PassengerCount, Timestamp
                FROM DensityCount
                WHERE (Camera_ID, Timestamp) IN (
                    SELECT Camera_ID, MAX(Timestamp)
                    FROM DensityCount
                    GROUP BY Camera_ID
                )
            ) dc ON c.Camera_ID = dc.Camera_ID
            GROUP BY b.BusStop_ID, b.Location_Name, dc.PassengerCount, dc.Timestamp
            ORDER BY dc.Timestamp DESC;
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Table Data Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
  
// --- API 4: รายละเอียดกล้องรายสถานี (สำหรับ Modal) ---
app.get('/api/cameras/:busStopId', async (req, res) => {
    const { busStopId } = req.params;
    try {
        const sql = `
            SELECT Camera_ID as id, Name as cameraName, IP_Address as ipAddress, 'Online' as status
            FROM Cameras
            WHERE BusStop_ID = ?
        `;
        const [rows] = await db.query(sql, [busStopId]);
        res.json(rows);
    } catch (error) {
        console.error("Camera API Error:", error);
        res.status(500).send("Error");
    }
});

// --- API 5: ข้อมูลแผนที่ ---
app.get('/api/map-data', async (req, res) => {
    try {
        const [stops] = await db.query('SELECT Name, latitude, longitude FROM BusStop WHERE latitude IS NOT NULL');
        res.json(stops);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

// --- API 6: ข้อมูลประวัติย้อนหลัง (เพิ่มใหม่ตามความต้องการของคุณ) ---
app.get('/api/history', async (req, res) => {
    const { cameraId, date, startTime, endTime } = req.query;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!cameraId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing parameters (cameraId, date, startTime, or endTime)" });
    }

    try {
        const sql = `
            SELECT 
                DATE_FORMAT(Timestamp, '%H:%i') AS timeLabel,
                PassengerCount
            FROM DensityCount
            WHERE Camera_ID = ? 
              AND DATE(Timestamp) = ?
              AND TIME(Timestamp) BETWEEN ? AND ?
            ORDER BY Timestamp ASC
        `;
        
        const [rows] = await db.query(sql, [cameraId, date, startTime, endTime]);
        
        res.json({
            labels: rows.map(r => r.timeLabel),
            series: [rows.map(r => r.PassengerCount)]
        });
    } catch (error) {
        console.error("History API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`💻 Server running at http://localhost:${PORT}`);
});