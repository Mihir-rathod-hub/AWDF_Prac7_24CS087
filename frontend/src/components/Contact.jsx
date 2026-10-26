import React, { useState } from 'react';

/**
 * Contact Component
 * Features:
 *  - Controlled message input using useState
 *  - Real-time character count and message preview
 *  - Character limit enforcement
 *  - Clear button to reset message
 *  - Help message toggle using useState
 *  - Email contact link (24cs087@charusat.edu.in)
 */
function Contact() {
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const MAX_LIMIT = 250;

  const handleMessageChange = (e) => {
    if (e.target.value.length <= MAX_LIMIT) {
      setMessage(e.target.value);
    }
  };

  const handleClear = () => {
    setMessage('');
  };

  const handleToggleHelp = () => {
    setShowHelp((prev) => !prev);
  };

  return (
    <section className="portfolio-section contact-section">
      <div className="section-header">
        <h2 className="section-title">Contact</h2>
        <div className="section-line"></div>
      </div>

      <div className="contact-grid">
        {/* Contact Information Card */}
        <div className="contact-info-card">
          <h3 className="contact-card-title">Get in Touch</h3>
          <p className="contact-card-desc">
            For academic inquiries, collaboration opportunities, or questions:
          </p>
          <div className="contact-method">
            <span className="contact-method-label">Email:</span>
            <a
              href="mailto:24cs087@charusat.edu.in"
              className="contact-email-link"
            >
              24cs087@charusat.edu.in
            </a>
          </div>

          <div className="help-toggle-wrapper">
            <button
              type="button"
              onClick={handleToggleHelp}
              className="help-toggle-btn"
            >
              {showHelp ? 'Hide Help' : 'Need Help?'}
            </button>
            {showHelp && (
              <div className="help-box">
                <p>
                  Use the message box to compose thoughts, questions, or ideas.
                  To send a message directly, click the email address above to open your default email application.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Form Card */}
        <div className="message-form-card">
          <h3 className="contact-card-title">Send Me a Message</h3>
          <p className="contact-card-desc">
            Have a question or an idea for a project? Feel free to leave a message below.
          </p>

          <div className="form-group">
            <label htmlFor="user-message" className="form-label">
              Message:
            </label>
            <textarea
              id="user-message"
              className="form-textarea"
              rows="4"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message here..."
              maxLength={MAX_LIMIT}
            />
            <div className="form-meta">
              <span className="char-counter">
                {message.length} / {MAX_LIMIT} characters
              </span>
              {message && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="clear-btn"
                >
                  Clear Message
                </button>
              )}
            </div>
          </div>

          {/* Real-time Message Preview */}
          <div className="preview-container">
            <h4 className="preview-label">Message Preview</h4>
            <div className="preview-box">
              {message ? (
                <p className="preview-text">{message}</p>
              ) : (
                <p className="preview-placeholder">
                  (Your message will appear here as you type...)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
