import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Terms.css';

export default function Terms() {
  const navigate = useNavigate();
  const [atBottom, setAtBottom] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const target = endRef.current;
    if (!target) return;

    const ob = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setAtBottom(e.isIntersecting && e.intersectionRatio === 1);
      },
      { root: null, threshold: 1.0 }
    );

    ob.observe(target);
    return () => ob.disconnect();
  }, []);

  const handleCancel = () => navigate('/register');
  const handleAgree = () => navigate('/register');

  return (
    <div className="tos-wrap pro">
      <header className="tos-hero" role="banner">
        <div className="tos-hero-bar">
          <button
            type="button"
            className="tos-backicon"
            aria-label="Back to registration"
            onClick={() => navigate('/register')}
          >
           <svg
            className="tos-backicon-svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false" 
            >
            
          <path
            d="M15 19 L8 12 L15 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
          </svg>

          </button>
        </div>

        <h1 className="tos-hero-title">GenZDreamers Terms and Conditions</h1>
        <p className="tos-hero-sub">Your Agreement</p>
        <p className="tos-hero-meta">Last Revised: October 20, 2025</p>
      </header>

      <main className="tos-container pro" role="main" aria-labelledby="tos-title">
        <div className="tos-columns">
          <section className="tos-section">
            <p className="tos-p lead">
              Welcome to GenZDreamers. Our website, applications, and related services are offered
              for informational and commercial purposes to help users discover, purchase, and
              manage digital products and services provided by GenZDreamers. Please read these
              Terms carefully because they contain important legal obligations that govern your
              use of the Service.
            </p>

            <h3 className="tos-h3">1. Your Agreement</h3>
            <p className="tos-p">
              By accessing or using the Service, you agree to be bound by these Terms and our
              policies referenced here. If you do not agree, do not use the Service.
            </p>
            <p className="tos-p">
              Changes to these Terms may be made at any time at our discretion and become effective
              upon posting. Continued use after updates constitutes acceptance of the revised
              Terms.
            </p>

            <h3 className="tos-h3">2. Privacy</h3>
            <p className="tos-p">
              Your use of the Service is also governed by our Privacy Policy, which explains how we
              collect, use, and safeguard personal information.
            </p>

            <h3 className="tos-h3">3. Accounts & Security</h3>
            <p className="tos-p">
              You are responsible for maintaining the confidentiality of your login credentials and
              for all activity under your account. Notify GenZDreamers immediately of any suspected
              unauthorized use or security incident.
            </p>

            <h3 className="tos-h3">4. Acceptable Use</h3>
            <p className="tos-p">
              Do not use the Service to violate laws, infringe intellectual property, transmit
              malware, harvest data, or disrupt the network. We may suspend or terminate accounts
              involved in prohibited activities.
            </p>

            <h3 className="tos-h3">5. Intellectual Property</h3>
            <p className="tos-p">
              All content, trademarks, logos, software, and materials made available through the
              Service are the property of GenZDreamers or its licensors and are protected by
              applicable IP laws.
            </p>

            <h3 className="tos-h3">6. License & Restrictions</h3>
            <p className="tos-p">
              GenZDreamers grants you a limited, non-exclusive, non-transferable license to access
              and use the Service for its intended purpose. Reverse engineering, scraping,
              automated data extraction, or derivative works are not permitted except as allowed by
              law.
            </p>

            <h3 className="tos-h3">7. Payments & Billing</h3>
            <p className="tos-p">
              Prices, taxes, and billing cycles are shown at checkout. By submitting a payment
              method, you authorize recurring charges for subscriptions until canceled. Invoices
              and receipts are sent to the email on file.
            </p>

            <h3 className="tos-h3">8. Cancellations & Refunds</h3>
            <p className="tos-p">
              You may cancel subscriptions in Account Settings, effective at the end of the current
              cycle. Refunds, if applicable, follow the plan’s terms and mandatory consumer
              protections in your jurisdiction.
            </p>

            <h3 className="tos-h3">9. Third-Party Services</h3>
            <p className="tos-p">
              The Service may link to or integrate with third-party tools. GenZDreamers is not
              responsible for third-party content, policies, or practices; your use of those
              services is governed by their terms.
            </p>

            <h3 className="tos-h3">10. Disclaimers</h3>
            <p className="tos-p">
              The Service is provided “as is” and “as available,” without warranties of any kind,
              to the fullest extent permitted by law. Use of the Service is at your sole risk.
            </p>

            <h3 className="tos-h3">11. Limitation of Liability</h3>
            <p className="tos-p">
              To the maximum extent permitted by law, GenZDreamers will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or lost profits or revenues
              arising from your use of the Service.
            </p>

            <h3 className="tos-h3">12. Indemnification</h3>
            <p className="tos-p">
              You agree to defend, indemnify, and hold harmless GenZDreamers and its affiliates from
              claims, losses, liabilities, costs, or expenses arising out of your use of the Service
              or violation of these Terms.
            </p>

            <h3 className="tos-h3">13. Termination</h3>
            <p className="tos-p">
              We may suspend or terminate access for conduct that violates these Terms or poses risk
              to the Service or other users. Certain provisions survive termination, including IP,
              disclaimers, and liability limits.
            </p>

            <h3 className="tos-h3">14. Governing Law & Disputes</h3>
            <p className="tos-p">
              These Terms are governed by the laws of India, without regard to conflict-of-law
              principles. Courts in Pune, Maharashtra, will have exclusive jurisdiction unless
              binding arbitration is specified in a separate agreement.
            </p>

            <h3 className="tos-h3">15. Contact</h3>
            <p className="tos-p">
              GenZDreamers Pvt. Ltd., 401 Innovation Park, Baner, Pune 411045, India •
              support@genzdreamers.com • +91-20-4000-1234
            </p>

            <div ref={endRef} className="tos-end-sentinel" aria-hidden="true" />
          </section>
        </div>
      </main>

      <div className={`tos-fab ${atBottom ? 'show' : ''}`} role="region" aria-label="Actions">
        <button type="button" className="tos-btn tos-btn-ghost" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className="tos-btn tos-btn-primary" onClick={handleAgree}>
          Agree
        </button>
      </div>
    </div>
  );
}
