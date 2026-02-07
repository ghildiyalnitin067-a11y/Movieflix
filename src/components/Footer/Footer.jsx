import React from 'react'
import './Footer.css'
import Button from 'react-bootstrap/Button'
import { useNavigate } from 'react-router-dom'

const Footer = () => {

  const navigate = useNavigate()

  return (
    <div className="footer-conatiner">
        <div className="footer-card">
            <div className="content">
                <div className="text">
                    <h1>Start your free trial today !</h1>
                    <p>This is a clear and concise call to action that encourages users to sign up for a free trail of MovieFlix</p>
                </div>
                <div className="start-btn">
                     <Button
                       className='start start-trial'
                       variant="danger"
                       onClick={() => navigate('/subscription')}
                     >
                       Start Free Trial
                     </Button>
                </div>
            </div>
        </div>

        <div className="footer-section">
            <div className="footer">
            <ul>
                <h4>Home</h4>
                <p>Devices</p>
                <p>Categories</p>
                <p>Pricing</p>
                <p>FAQ</p>
            </ul>
            <ul>
                <h4>Movies</h4>
                <p>Gernes</p>
                <p>Trending</p>
                <p>New Release</p>
                <p>Popular</p>
            </ul>
            <ul>
                <h4>Shows</h4>
                <p>Gernes</p>
                <p>Trending</p>
                <p>New Release</p>
                <p>Popular</p>
            </ul>
            <ul>
                <h4>Support</h4>
                <p>Contact us</p>
            </ul>
            <ul>
                <h4>Subscription</h4>
                <p>Plans</p>
                <p>Features</p>
            </ul>
            <ul>
                <h4>Contact with us</h4>
                <div className="fo-icons">
                     <i className="fa-brands fa-square-facebook"></i>
                     <i className="fa-brands fa-square-twitter"></i>
                     <i className="fa-brands fa-linkedin"></i>
                </div>
            </ul>
            </div>

            <div className="footer-divider"></div>

            <div className="end-title">
                <h3>@2026 Movieflix All Rights Reserved | NitinGhildiyal</h3>
                <div className="tags">
                    <p>Terms of Use</p>
                    <p>Privacy Policy</p>
                    <p>Cookie Policy</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer
