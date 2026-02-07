
import React from "react";
import "./Features.css";

const Features = () => {
  const features = [
    {
      icon: "fa-mobile",
      title: "Smartphones",
      desc: "Stream movies and shows seamlessly on Android and iOS smartphones with optimized performance.",
    },
    {
      icon: "fa-tablet",
      title: "Tablet",
      desc: "Enjoy immersive entertainment on tablets with high-quality visuals and smooth playback.",
    },
    {
      icon: "fa-tv",
      title: "Smart TV",
      desc: "Experience cinematic viewing on Smart TVs with crystal-clear resolution and surround sound.",
    },
    {
      icon: "fa-laptop",
      title: "Laptops",
      desc: "Watch your favourite content on laptops with adaptive streaming and fast loading speeds.",
    },
    {
      icon: "fa-xbox",
      title: "Gaming Consoles",
      desc: "Stream movies and shows directly on gaming consoles with powerful performance.",
    },
    {
      icon: "fa-vr-cardboard",
      title: "VR Headsets",
      desc: "Explore entertainment in virtual reality with immersive and futuristic viewing experiences.",
    },
  ];

  return (
    <div className="features-container">
      <div className="features-header">
        <h1>We Provide you streaming experience across various devices.</h1>
        <p>
          With MovieFlix, you can enjoy your favourite movies and TV shows anytime,
          anywhere. Our platform is designed to be compatible with a wide range of devices.
        </p>
      </div>

      <div className="features-grid">
        {features.map((item, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-top">
              <div className="feature-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <h3>{item.title}</h3>
            </div>
            <p className="feature-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
