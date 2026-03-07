import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import { Card, Container, Row, Col, Form } from "react-bootstrap";
import "chartist/dist/chartist.min.css";

/* ===================== STYLE ===================== */
const themeStyle = `
.chart-scroll {
  overflow-x: auto;
  overflow-y: hidden;
}

.history-header {
  background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%) !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 20px !important;
}

.history-header .card-title {
  color: white !important;
  margin: 0 !important;
  font-weight: bold;
  font-size: 1.25rem;
}

.form-select {
  border-radius: 12px !important;
  padding: 10px 18px !important;
  border: 1px solid #e9ecef !important;
  background-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  font-size: 14px !important;
  color: #525f7f !important;
}

.form-label {
  font-weight: 700;
  color: #5e72e4;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  margin-bottom: 8px;
}

.card {
  border: none !important;
  box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15) !important;
  margin-bottom: 30px !important;
  border-radius: 0.75rem !important;
  background-color: #ffffff !important;
}

.btn-primary,
.badge-primary {
  background-color: #5e72e4 !important;
  border-color: #5e72e4 !important;
  border-radius: 10px !important;
}

.bg-transparent {
  background-color: transparent !important;
}
`;

/* ===================== CONSTANT ===================== */

const CAMERA_MAP = {
  CAM01: "วิศวะ",
  CAM02: "วิทยาศาสตร์",
  CAM03: "ศิลปศาสตร์",
  CAM04: "PKY",
};

/* ===================== UTIL FUNCTION ===================== */

const average30Min = (labels, series) => {
  const bucket = {};

  labels.forEach((label, idx) => {
    const [h, m] = label.split(":").map(Number);
    const roundedMin = m < 30 ? 0 : 30;

    const key = `${h.toString().padStart(2, "0")}:${roundedMin
      .toString()
      .padStart(2, "0")}`;

    if (!bucket[key]) {
      bucket[key] = { sum: 0, count: 0 };
    }

    bucket[key].sum += series[idx];
    bucket[key].count += 1;
  });

  const newLabels = [];
  const newSeries = [];

  Object.keys(bucket).forEach((key) => {
    newLabels.push(key);
    newSeries.push(Math.round(bucket[key].sum / bucket[key].count));
  });

  return { labels: newLabels, series: newSeries };
};

/* ===================== COMPONENT ===================== */

function History() {
  const currentYearCE = new Date().getFullYear();
  const currentYearBE = currentYearCE + 543;

  const [selectedDay, setSelectedDay] = useState(
    new Date().getDate().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [selectedYearBE, setSelectedYearBE] = useState(
    currentYearBE.toString()
  );
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("22:00");
  const [cameraId, setCameraId] = useState("CAM01");

  const [chartState, setChartState] = useState({
    labels: [],
    series: [[]],
  });

  const monthsThai = [
    { val: "01", name: "มกราคม" },
    { val: "02", name: "กุมภาพันธ์" },
    { val: "03", name: "มีนาคม" },
    { val: "04", name: "เมษายน" },
    { val: "05", name: "พฤษภาคม" },
    { val: "06", name: "มิถุนายน" },
    { val: "07", name: "กรกฎาคม" },
    { val: "08", name: "สิงหาคม" },
    { val: "09", name: "กันยายน" },
    { val: "10", name: "ตุลาคม" },
    { val: "11", name: "พฤศจิกายน" },
    { val: "12", name: "ธันวาคม" },
  ];

  const yearsBE = Array.from({ length: 2 }, (_, i) =>
    (currentYearBE - i).toString()
  );

  const daysArray = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString()
  );

  const timeOptions = [];
  for (let h = 7; h <= 22; h++) {
    timeOptions.push(`${h.toString().padStart(2, "0")}:00`);
  }

  const handleSearch = async () => {
    const yearCE = parseInt(selectedYearBE) - 543;
    const formattedDate = `${yearCE}-${selectedMonth}-${selectedDay.padStart(
      2,
      "0"
    )}`;

    const API_BASE = "http://localhost:3001";

    try {
      const res = await fetch(
        `${API_BASE}/api/history?cameraId=${cameraId}&date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`
      );

      const result = await res.json();

      if (result && result.labels && result.series) {
        const averaged = average30Min(
          result.labels,
          result.series[0]
        );

        setChartState({
          labels: averaged.labels,
          series: [averaged.series],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedDay, selectedMonth, selectedYearBE, startTime, endTime, cameraId]);

  const barChartOptions = {
    height: "400px",
    axisX: { showGrid: false, offset: 60 },
    axisY: { onlyInteger: true, low: 0 },
    fullWidth: true,
  };

  const drawBarLabels = (data) => {
    if (data.type === "bar") {
      const color = data.value.y > 20 ? "#f5365c" : "#2dce89";

      data.element.attr({
        style: `stroke: ${color}; stroke-width: 30px;`,
      });

      data.group
        .elem("text", {
          x: data.x2,
          y: data.y2 - 15,
          style:
            "font-size:14px;fill:#000;font-weight:bold;text-anchor:middle",
        })
        .text(data.value.y);
    }
  };

  return (
    <Container fluid className="py-4">
      <style>{themeStyle}</style>

      <Row>
        <Col md="12">
          <Card>
            <Card.Header className="history-header">
              <Card.Title as="h4">
                ค้นหาข้อมูลย้อนหลัง
              </Card.Title>
            </Card.Header>

            <Card.Body className="px-4 py-4">
              <Row className="align-items-end g-3">

                <Col lg="3" md="4">
                  <Form.Group>
                    <Form.Label className="form-label">
                      เลือกป้ายรถเมล์
                    </Form.Label>
                    <Form.Select
                      value={cameraId}
                      onChange={(e) => setCameraId(e.target.value)}
                    >
                      {Object.entries(CAMERA_MAP).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col lg="4" md="8">
                  <Form.Label className="form-label">
                    เลือกวันที่
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                    >
                      {daysArray.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {monthsThai.map((m) => (
                        <option key={m.val} value={m.val}>
                          {m.name}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Select
                      value={selectedYearBE}
                      onChange={(e) =>
                        setSelectedYearBE(e.target.value)
                      }
                    >
                      {yearsBE.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

                <Col lg="5" md="12">
                  <Form.Label className="form-label">
                    เลือกช่วงเวลา
                  </Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Select
                      value={startTime}
                      onChange={(e) =>
                        setStartTime(e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Select>

                    <span className="text-muted px-1 small">
                      ถึง
                    </span>

                    <Form.Select
                      value={endTime}
                      onChange={(e) =>
                        setEndTime(e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {chartState.labels.length > 0 && (
        <Row>
          <Col md="12">
            <Card>
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h6 className="text-uppercase text-muted mb-1">
                  Overview
                </h6>
                <h2 className="mb-0 h4 font-weight-bold">
                  กราฟสถิติ :{" "}
                  {CAMERA_MAP[cameraId] || cameraId}
                </h2>
              </Card.Header>

              <Card.Body className="px-4">
                <div className="chart-scroll">
                  <div
                    style={{
                      width: Math.max(
                        chartState.labels.length * 60,
                        600
                      ),
                      height: "400px",
                    }}
                  >
                    <ChartistGraph
                      data={{
                        labels: chartState.labels,
                        series: chartState.series,
                      }}
                      type="Bar"
                      options={barChartOptions}
                      listener={{ draw: drawBarLabels }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default History;