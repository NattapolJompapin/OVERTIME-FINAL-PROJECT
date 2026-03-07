import React from "react";
import { useLocation, Route, Switch } from "react-router-dom";
import Footer from "components/Footer/Footer";
import routes from "routes.js";

function Admin() {
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const [overlayOpen, setOverlayOpen] = React.useState(false);

  const getRoutes = (routes) =>
    routes.map((prop, key) =>
      prop.layout === "/admin" ? (
        <Route
          path={prop.layout + prop.path}
          render={(props) => <prop.component {...props} />}
          key={key}
        />
      ) : null
    );

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanel.current) mainPanel.current.scrollTop = 0;
  }, [location]);

  return (
    <>
      <div className="wrapper">
        <div
          className="main-panel"
          ref={mainPanel}
          style={{ width: "100%" }}
        >
          <div className="content">
            <Switch>{getRoutes(routes)}</Switch>
          </div>
          <Footer />
        </div>
      </div>

      {/* 🔘 Floating Menu Button (ย้ายมาไว้ที่ top-left) */}
      <button
        onClick={() => setOverlayOpen(true)}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px", // เปลี่ยนจาก right เป็น left
          zIndex: 5000,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          background: "#1DC7EA",
          color: "#fff",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        ☰
      </button>

      {/* ⬛ Backdrop */}
      {overlayOpen && (
        <div
          onClick={() => setOverlayOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            background: "rgba(0,0,0,0.4)",
            zIndex: 4000,
          }}
        />
      )}

      {/* 📋 Overlay Menu (ย้ายมาเปิดจากด้านซ้าย) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0, // เปลี่ยนจาก right เป็น left
          height: "100dvh",
          width: "280px",
          background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
          color: "#fff",
          zIndex: 4500,
          padding: "24px 20px",
          // เปลี่ยนจากเลื่อนไปขวา (100%) เป็นเลื่อนไปซ้าย (-100%) เมื่อปิด
          transform: overlayOpen
            ? "translateX(0)"
            : "translateX(-100%)", 
          transition: "transform 0.3s ease",
          boxShadow: "4px 0 20px rgba(0,0,0,0.4)", // เปลี่ยนเงาให้มาทางขวา
        }}
      >
        <br></br>
        <h4 style={{ marginBottom: "28px" }}> เมนู</h4>

        {[
          { name: "ข้อมูลรายวัน", path: "/admin/dashboard", icon: "🚌" },
          { name: "ช้อมูลย้อนหลัง", path: "/admin/history", icon: "📊" },
        ].map((item) => (
          <div
            key={item.path}
            onClick={() => {
              setOverlayOpen(false);
              window.location.href = item.path;
            }}
            style={{
              cursor: "pointer",
              marginBottom: "16px",
              fontSize: "16px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {item.icon} {item.name}
          </div>
        ))}
      </div>
    </>
  );
}

export default Admin;