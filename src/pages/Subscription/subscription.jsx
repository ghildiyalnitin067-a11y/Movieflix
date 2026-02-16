import "./subscription.css";
import Plans from "../../components/Plans/Plans"




const PlansChart = () => {
  const [billing, setBilling] = useState("monthly");

  const prices = {
    monthly: {
      basic: "₹199",
      standard: "₹299",
      premium: "₹399",
    },
    yearly: {
      basic: "₹1499",
      standard: "₹2199",
      premium: "₹2999",
    },
  };

  return (
    <div className="sub-plan">
    <Plans/>
    <div className="plans-chart-section">
      <h1>Compare our plans and find the right one for you</h1>
      <p>Switch between monthly and yearly billing to see the best value.</p>

 
      <div className="billing-toggle">
        <button
          className={billing === "monthly" ? "active" : ""}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>
        <button
          className={billing === "yearly" ? "active" : ""}
          onClick={() => setBilling("yearly")}
        >
          Yearly
        </button>
      </div>

   
      <div className="plans-table">
        <table>
          <thead>
            <tr>
              <th>Features</th>
              <th>Basic</th>
              <th>Standard</th>
              <th>Premium</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Price</td>
              <td>{prices[billing].basic}</td>
              <td>{prices[billing].standard}</td>
              <td>{prices[billing].premium}</td>
            </tr>

            <tr>
              <td>Video Quality</td>
              <td>HD (720p)</td>
              <td>Full HD (1080p)</td>
              <td>Ultra HD (4K)</td>
            </tr>

            <tr>
              <td>Devices</td>
              <td>1 Device</td>
              <td>2 Devices</td>
              <td>4 Devices</td>
            </tr>

            <tr>
              <td>Simultaneous Streaming</td>
              <td>1 Screen</td>
              <td>2 Screens</td>
              <td>4 Screens</td>
            </tr>

            <tr>
              <td>Content Library</td>
              <td>Limited Movies & Shows</td>
              <td>Most New Releases</td>
              <td>All Movies & Shows</td>
            </tr>

            <tr>
              <td>Offline Download</td>
              <td>❌ No</td>
              <td>✅ Yes</td>
              <td>✅ Yes</td>
            </tr>

            <tr>
              <td>Ads Free</td>
              <td>❌ No</td>
              <td>✅ Yes</td>
              <td>✅ Yes</td>
            </tr>

            <tr>
              <td>Customer Support</td>
              <td>Email Support</td>
              <td>Priority Support</td>
              <td>24/7 Premium Support</td>
            </tr>

            <tr>
              <td>Free Trial</td>
              <td>7 Days</td>
              <td>7 Days</td>
              <td>14 Days</td>
            </tr>

           
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default PlansChart;
