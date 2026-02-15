import React, { useRef, useState, useEffect } from "react";
import "./Testimonials.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";


const Testimonials = () => {
  const rowRef = useRef(null);
  const { user, loading: authLoading, getAuthToken } = useAuth();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    rating: 5,
    text: ""
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [authError, setAuthError] = useState(false);




  // Fetch testimonials from API
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API_URL}/testimonials`);
      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      // Fallback to empty array if API fails
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if auth is still loading
    if (authLoading) {
      setSubmitStatus("error");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      setAuthError(true);
      setSubmitStatus("error");
      return;
    }


    setSubmitStatus("submitting");
    setAuthError(false);

    try {
      // Get Firebase ID token from AuthContext
      const token = await getAuthToken();
      
      if (!token) {
        setAuthError(true);
        setSubmitStatus("error");
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/testimonials`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", role: "", rating: 5, text: "" });
        
        // Refresh testimonials to show the newly submitted one immediately
        await fetchTestimonials();
        
        setTimeout(() => {
          setShowForm(false);
          setSubmitStatus(null);
        }, 3000);
      }



    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    }
  };


  return (
    <section className="movie-row testimonials-section">
      <div className="row-header">
        <h2>
          What Our <span>Users</span> Say
        </h2>
        <div className="header-actions">
          <button 
            className="add-review-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "✕ Close" : "✎ Write a Review"}
          </button>
          <div className="row-arrows">
            <button onClick={scrollLeft}>❮</button>
            <button onClick={scrollRight}>❯</button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="testimonial-form-container">
          <form className="testimonial-form" onSubmit={handleSubmit}>
            <h3>Share Your Experience</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div className="form-group">
                <label>Your Role (Optional)</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Movie Enthusiast"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} className="star-label">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={formData.rating === star}
                      onChange={handleInputChange}
                    />
                    <span className={star <= formData.rating ? "filled" : ""}>★</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Your Review *</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                maxLength={500}
                rows={4}
                placeholder="Tell us what you love about MovieFlix..."
              />
              <span className="char-count">{formData.text.length}/500</span>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitStatus === "submitting"}
              >
                {submitStatus === "submitting" ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {submitStatus === "success" && (
              <div className="status-message success">
                ✓ Thank you! Your review has been posted and is now visible.
              </div>
            )}


            {submitStatus === "error" && (
              <div className="status-message error">
                {authError ? (
                  <>
                    ✗ Please <a href="/login">sign in</a> to submit a review.
                  </>
                ) : (
                  "✗ Failed to submit. Please try again."
                )}
              </div>
            )}
            {!authLoading && !user && (
              <div className="status-message info">
                ℹ️ Please <a href="/login">sign in</a> to submit a review.
              </div>
            )}
            
            {authLoading && (
              <div className="status-message info">
                ℹ️ Checking authentication...
              </div>
            )}


          </form>
        </div>
      )}

      {/* Testimonials List */}
      <div className="row-posters testimonials-row" ref={rowRef}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div className="testimonial-card skeleton" key={i}>
              <div className="skeleton-avatar" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))
        ) : testimonials.length > 0 ? (
          testimonials.map((testimonial) => (
            <div key={testimonial._id} className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <img
                    src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=e50914&color=fff&size=150`}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <span className="testimonial-role">{testimonial.role || 'MovieFlix User'}</span>
                  </div>
                </div>
                
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-testimonials">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
