import React, { useState, useEffect } from "react";
// ลบ import ChartistGraph ออกเนื่องจากไม่ได้ใช้งานแล้ว
import {
  Badge,
  Card,
  Table,
  Container,
  Row,
  Col
} from "react-bootstrap";

const themeStyle = `
  /* แก้ไขให้ไม่มีขอบขาวรอบตัวแอป */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background-color: #f8f9fc !important;
    font-family: 'Inter', 'Kanit', sans-serif;
    color: #4a5568;
    overflow-x: hidden;
  }

  /* จัดการส่วนหัวข้อและโลโก้ในพื้นหลังม่วง */
  .header-content-flex {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    width: 100%;
  }

  .header-logo {
    height: 60px; 
    width: auto;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)); 
  } 
    
  /* ปรับแต่ง Main Content ให้ชิดขอบ */
  .content {
    padding: 0 !important;
  }

  .header-purple-bg { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; 
    padding-top: 5rem; 
    padding-bottom: 8rem; 
    margin-bottom: -6rem;
    box-shadow: 0 4px 20px rgba(118, 75, 162, 0.2);
    width: 100%;
    position: relative;
  }

  .card { 
    border: 1px solid rgba(118, 75, 162, 0.1); 
    border-radius: 1.25rem; 
    box-shadow: 0 10px 25px rgba(118, 75, 162, 0.05);
    margin-bottom: 1.5rem;
    background: #fff;
    overflow: hidden;
  }
  
  .card-accent-purple { border-top: 5px solid #764ba2; }

  .icon-circle {
    width: 60px;
    height: 60px;
    background-color: #f3f0ff;
    border: 2px solid #764ba2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(118, 75, 162, 0.15);
    transition: transform 0.3s ease;
  }

  .card:hover .icon-circle {
    transform: scale(1.1) rotate(5deg);
  }

  .btn-reset-map {
    background-color: #f3f0ff;
    color: #764ba2;
    border: 1px solid #764ba2;
    font-weight: 600;
    border-radius: 8px;
    padding: 5px 15px;
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  .btn-reset-map:hover {
    background-color: #764ba2;
    color: white;
  }

  .table-clean thead th {
    background-color: #f3f0ff;
    color: #6b46c1;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 1rem 1.25rem;
  }
  
  /* หัวข้อใหญ่ (เช่น ข้อมูลรายวัน) */
  h2 {
    font-size: clamp(1.4rem, 2.5vw, 2rem);
  }

  /* หัวข้อ Card */
  h3 {
    font-size: clamp(1.3rem, 2vw, 1.75rem);
  }

  /* Card Title */
  .card-title,
  h5 {
    font-size: clamp(1rem, 1.5vw, 1.25rem);
  }

  /* ตัวเลขจำนวนคน */
  .fs-5 {
    font-size: clamp(1rem, 1.4vw, 1.25rem) !important;
  }

  /* ข้อความทั่วไป */
  body,
  table,
  p {
    font-size: clamp(0.85rem, 1.2vw, 1rem);
  }

  /* badge สถานะ */
  .badge {
    font-size: clamp(0.75rem, 1vw, 0.85rem);
  }

  .badge-soft-success { background-color: #d1fae5; color: #065f46; border-radius: 8px; padding: 6px 12px; border: none; }
  .badge-soft-warning { background-color: #fef3c7; color: #b45309; border-radius: 8px; padding: 6px 12px; border: none; }
  .badge-soft-orange { background-color: #ffedd5; color: #c2410c; border-radius: 8px; padding: 6px 12px; border: none; }
  .badge-soft-danger { background-color: #fee2e2; color: #991b1b; border-radius: 8px; padding: 6px 12px; border: none; }
`;

function Dashboard() {
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState({ busStops: 0 });
  const [mapInstance, setMapInstance] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);

  const initialView = { lat: 19.029, lng: 99.897, zoom: 15 };
  
  const stationCoords = {
    "วิศวะ": { lat: 19.030734, lng: 99.900750 },
    "วิทยาศาสตร์": { lat: 19.030488, lng: 99.897405 },
    "ศิลปศาสตร์": { lat: 19.029554, lng: 99.895707 },
    "PKY": { lat: 19.025677, lng: 99.894938 }
  };

  const API_BASE = "http://localhost:3001";
  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE}/api/dashboard-stats`);
      const statsJson = await statsRes.json();
      setStats({ busStops: statsJson.capacity || 0 });

      const tableRes = await fetch(`${API_BASE}/api/table-data`);
      const tableJson = await tableRes.json();
      setTableData(Array.isArray(tableJson) ? tableJson : tableJson.data || []);
      // ลบส่วนการดึงข้อมูล Chart
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const L = window.L;
      const map = L.map("map-id").setView([initialView.lat, initialView.lng], initialView.zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      setMapInstance(map);
    };
    document.body.appendChild(script);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapInstance && tableData.length > 0 && window.L) {
      const L = window.L;
      mapMarkers.forEach(m => m.remove()); 
      
      const newMarkers = tableData.map(item => {
        const coords = stationCoords[item.stationName] || { lat: 0, lng: 0 };
        
        // กำหนดสีตามจำนวนคน 4 ระดับ
        let bgColor = '#2dce89'; // 0-20 (สีเขียว)
        if (item.passengerCount >= 41) {
          bgColor = '#f5365c'; // 41+ (สีชมพู/แดง)
        } else if (item.passengerCount >= 31) {
          bgColor = '#fd7e14'; // 31-40 (สีส้ม)
        } else if (item.passengerCount >= 21) {
          bgColor = '#ffc107'; // 21-30 (สีเหลือง)
        }

        const icon = L.divIcon({
          className: 'custom-icon',
          html: `<div style="background-color: ${bgColor}; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${item.passengerCount}</div>`,
          iconSize: [35, 35],
          iconAnchor: [17, 17]
        });
        return L.marker([coords.lat, coords.lng], { icon }).addTo(mapInstance).bindPopup(`<b>${item.stationName}</b>`);
      });
      setMapMarkers(newMarkers);
    }
  }, [tableData, mapInstance]);

  const resetMap = () => {
    if (mapInstance) {
      mapInstance.flyTo([initialView.lat, initialView.lng], initialView.zoom, {
        animate: true,
        duration: 1.5
      });
    }
  };

  return (
    <>
      <style>{themeStyle}</style>
        <div className="header-purple-bg">
          <Container fluid className="px-4">
            <div className="header-content-flex">
              <h2 className="text-white fw-bold mb-0">ข้อมูลรายวัน</h2>
              <img 
                src={require("assets/img/UP.png")} 
                alt="University of Phayao Logo" 
                className="header-logo"
              />
            </div>
          </Container>
        </div>

        <Container fluid className="px-4">
          <Row>
            <Col lg="3" md="6">
              <Card className="border-0 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center p-4">
                  <div>
                    <p className="text-uppercase text-muted small fw-bold mb-1">ป้ายรถเมล์ทั้งหมด</p>
                    <h3 className="fw-bold mb-0 text-dark">{stats.busStops}</h3>
                  </div>
                  <div className="icon-circle">
                    <span style={{ fontSize: '28px' }}>🚌</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col xs="12">
              <Card className="shadow-sm">
                <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                  <Card.Title as="h5" className="fw-bold text-dark m-0">📍 แผนที่เรียลไทม์</Card.Title>
                  <button className="btn-reset-map" onClick={resetMap}>↺ รีเซ็ต</button>
                </Card.Header>
                <Card.Body>
                  <div id="map-id" style={{ height: "400px", width: "100%", borderRadius: "12px" }}></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-2 pb-5">
            <Col xs="12">
              <Card className="card-accent-purple shadow-sm">
                <Card.Header className="bg-white border-0 pt-4">
                  <Card.Title as="h5" className="fw-bold text-dark m-0">สถานะเรียลไทม์</Card.Title>
                </Card.Header>
                <Card.Body className="p-0 mt-3">
                  <div className="table-responsive">
                    <Table className="table-clean mb-0">
                      <thead>
                        <tr>
                          <th>สถานี</th>
                          <th>ผู้โดยสาร</th>
                          <th>สถานะ</th>
                          <th>อัปเดตล่าสุด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item, index) => {
                          // กำหนด Badge และข้อความสถานะตาม 4 ระดับ
                          let badgeClass = "badge-soft-success";
                          let statusText = "● ปกติ";
                          
                          if (item.passengerCount >= 41) {
                            badgeClass = "badge-soft-danger";
                            statusText = "● หนาแน่นมาก";
                          } else if (item.passengerCount >= 31) {
                            badgeClass = "badge-soft-orange";
                            statusText = "● หนาแน่น";
                          } else if (item.passengerCount >= 21) {
                            badgeClass = "badge-soft-warning";
                            statusText = "● ปานกลาง";
                          }

                          return (
                            <tr key={index}>
                              <td className="fw-bold text-dark">{item.stationName}</td>
                              <td>
                                <span className="fs-5 fw-bold">{item.passengerCount}</span> 
                                <small className="text-muted ms-1"> คน</small>
                              </td>
                              <td>
                                <Badge className={badgeClass}>
                                  {statusText}
                                </Badge>
                              </td>
                              <td className="text-muted small">
                                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString("th-TH") : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* ส่วน Row ของกราฟย้อนหลังถูกนำออกเรียบร้อยแล้ว */}
        </Container>
    </>
  );
}

export default Dashboard;