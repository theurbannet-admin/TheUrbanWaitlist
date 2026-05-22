import React from 'react';

export default function Footer() {
    return (
        <div className="main-footer">
            <div className="footer-top">
                <div className="contact-group">
                    <div className="contact-header">
                        <h3>Contact Us</h3>
                    </div>

                    <div className="social-links">
                        <span>Follow Us</span>
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#"><i className="fa-brands fa-linkedin"></i></a>
                    </div>
                </div>
            </div>

            <hr className="footer-divider" />
            <div className="footer-bottom">
                <p>© 2026 TheUrbanNet LTD</p>

                <div className="footer-links">
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>
        </div>
    );
}