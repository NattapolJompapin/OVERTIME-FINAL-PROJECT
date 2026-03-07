import React, { Component } from "react";
import { Container } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
      <footer className="footer px-0 px-lg-3">
        <Container fluid>
          {/* ลบเนื้อหาภายใน <nav> ออกทั้งหมดแล้ว */}
          <nav>
          </nav>
        </Container>
      </footer>
    );
  }
}

export default Footer;