import React, { useState } from "react";
import "./support.css";
import emailjs from "@emailjs/browser";
import { useNavigate, useLocation } from "react-router-dom";



import poster1 from "../assets/images/poster1.jpg";
import poster2 from "../assets/images/poster2.jpg";
import poster3 from "../assets/images/poster3.jpg";
import poster4 from "../assets/images/poster4.jpg";
import poster5 from "../assets/images/poster5.jpg";
import poster6 from "../assets/images/poster6.jpg";
import poster7 from "../assets/images/poster7.jpg";
import poster8 from "../assets/images/poster8.jpg";
import poster9 from "../assets/images/poster9.jpg";
import poster10 from "../assets/images/poster10.jpg";
import poster11 from "../assets/images/poster11.jpg";
import poster12 from "../assets/images/poster12.jpg";

const posters = [
  poster1, poster2, poster3, poster4,
  poster5, poster6, poster7, poster8,
  poster9, poster10, poster11, poster12
];

const Support = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  
  const requireLogin = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname }
      });
      return false;
    }
    return true;
  };


  const sendEmail = (e) => {
    e.preventDefault();

   
    if (!requireLogin()) return;

    setLoading(true);
    setSuccess(false);

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAIL_TEMPLATE_ID,
        e.target,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY
      )
      .then(
        () => {
          setSuccess(true);
          setLoading(false);
          e.target.reset();
        },
        (error) => {
          console.error("EmailJS Error:", error);
          alert("❌ Failed to send message. Please try again!");
          setLoading(false);
        }
      );
  };

  return (
    <section className="support-section">
      <div className="support-container">
     
        <div className="support-left">
          <h1>Welcome to our Support Page 🎬</h1>
          <p>
            We're here to help you with any problems you may be having with our product.
          </p>

          <div className="support-posters">
            {posters.map((img, index) => (
              <div className="supp-card " key={index}>
                <img src={img} alt="movie poster" />
              </div>
            ))}
          </div>
        </div>

        <div className="support-right">
          <form className="support-form" onSubmit={sendEmail}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="from_name"
                  required
                  placeholder="Enter First Name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="Enter Last Name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="from_email"
                  required
                  placeholder="Enter your Email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter Phone Number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                required
                placeholder="Enter your message"
              ></textarea>
            </div>

            <div className="form-bottom">
              <label className="checkbox">
                <input type="checkbox" required />
                <span>I agree with Terms of Use and Privacy Policy</span>
              </label>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>

            {success && (
              <p className="success-msg">
                ✅ Message sent successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Support;
