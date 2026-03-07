import React, { useEffect, useState } from "react";
import { Container, Card, Badge, Row, Col } from "react-bootstrap";

function Maps() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจริงจาก API (เหมือนหน้า Dashboard)
    const fetchData = () => {
      fetch("http://localhost:3000/api/table-data")
        .then((res) => res.json())
        .then((data) => {
          const tableData = Array.isArray(data) ? data : data.data || [];
          
          // พิกัดคงที่ของแต่ละสถานี
          const stationCoords = {
            "วิศวะ": { lat: 19.030734, lng: 99.900750 },
            "วิทยาศาสตร์": { lat: 19.030488, lng: 99.897405 },
            "ศิลปศาสตร์": { lat: 19.029554, lng: 99.895707 },
            "PKY": { lat: 19.025677, lng: 99.894938 }
          };

          // แมพข้อมูลจาก API เข้ากับพิกัด
          const newMarkers = Object.keys(stationCoords).map((name) => {
            const found = tableData.find((item) => item.stationName === name);
            return {
              name: name,
              latitude: stationCoords[name].lat,
              longitude: stationCoords[name].lng,
              count: found ? found.passengerCount : 0, // ถ้าไม่มีข้อมูลให้เป็น 0
            };
          });
          setMarkers(newMarkers);
        })
        .catch((err) => console.error("Error fetching map data:", err));
    };

    fetchData(); // ดึงครั้งแรกทันที
    const interval = setInterval(fetchData, 5000); // อัปเดตทุก 5 วินาที

    // --- เริ่มต้นโหลด Leaflet (แบบไม่ใช้ Library ผ่าน npm) ---
    // 1. โหลด CSS ของ Leaflet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // 2. โหลด JavaScript ของ Leaflet
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const L = window.L;

      // ล้างข้อมูลแผนที่เดิมถ้ามีการ Re-render
      const container = L.DomUtil.get('map-container');
      if (container != null) {
        container._leaflet_id = null;
      }

      // สร้างแผนที่ (SetView ไปที่จุดกลางของกลุ่มอาคาร)
      const map = L.map("map-container").setView([19.029, 99.897], 16); // Zoom เข้ามาอีกนิด

      // ใช้แผนที่จาก OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // วางมาร์กเกอร์ตามพิกัด
      markers.forEach((point) => {
        // สร้าง Icon ที่แสดงตัวเลขจำนวนคน (Custom DivIcon)
        // วิธีนี้จะทำให้ตัวเลขเกาะติดกับพิกัดแผนที่ ไม่ลอยเวลาเลื่อน map
        const numberIcon = L.divIcon({
          className: 'custom-number-icon',
          html: `
            <div style="
              background-color: ${point.count > 20 ? '#dc3545' : '#28a745'};
              color: white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
              border: 3px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            ">
              ${point.count}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20], // จุดยึดอยู่ตรงกลาง (ครึ่งหนึ่งของ size) เพื่อให้ตรงพิกัดเป๊ะ
          popupAnchor: [0, -20]
        });

        L.marker([point.latitude, point.longitude], { icon: numberIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Kanit', sans-serif;">
              <strong>${point.name}</strong><br/>
              จำนวนคน: <span style="color: blue; font-size: 1.2em;">${point.count}</span> คน
            </div>
          `);
      });
    };
    document.body.appendChild(script);
    return () => clearInterval(interval); // เคลียร์ interval เมื่อปิดหน้า
  }, [markers]);

  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <Card.Title as="h4">📍 แผนที่แสดงความหนาแน่น (Bus Stops)</Card.Title>
          <p className="card-category">แสดงพิกัดและจำนวนคน ณ จุดรับส่ง</p>
        </Card.Header>

        <Card.Body>
          {/* ส่วนแผนที่ - เปลี่ยนจาก iframe เป็น div สำหรับ Leaflet */}
          <div
            id="map-container"
            style={{
              height: "500px",
              width: "100%",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #ddd"
            }}
          ></div>

          {/* รายละเอียดข้อมูลจำนวนคนด้านล่าง */}
          <h5 className="mb-3 font-weight-bold">📊 สถานะความหนาแน่น (Real-time)</h5>
          <div className="mt-2">
            {markers.map((stop, index) => (
              <Card key={index} className="mb-3 border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <Card.Body className="d-flex justify-content-between align-items-center p-3">
                  <div className="d-flex align-items-center">
                    {/* ไอคอนวงกลมสี */}
                    <div style={{
                      width: "45px", height: "45px", borderRadius: "50%",
                      background: stop.count > 20 ? "#fee2e2" : "#d1fae5",
                      color: stop.count > 20 ? "#991b1b" : "#065f46",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginRight: "15px", fontWeight: "bold", fontSize: "18px",
                      border: `2px solid ${stop.count > 20 ? "#fca5a5" : "#6ee7b7"}`
                    }}>
                      {stop.count}
                    </div>
                    <div>
                      <h6 className="mb-0 font-weight-bold text-dark" style={{ fontSize: "16px" }}>{stop.name}</h6>
                      <small className="text-muted">สถานะ: {stop.count > 20 ? "หนาแน่น" : "ปกติ"}</small>
                    </div>
                  </div>
                  <Badge bg={stop.count > 20 ? "danger" : "success"} pill style={{ fontSize: '0.9rem', padding: '8px 12px' }}>
                    {stop.count} คน
                  </Badge>
                </Card.Body>
              </Card>
            ))}
          </div>

          <p style={{ color: "green" }} className="mt-3">
            ✔ ดึงข้อมูลพิกัดและแสดงมาร์กเกอร์เรียบร้อยแล้ว
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Maps;