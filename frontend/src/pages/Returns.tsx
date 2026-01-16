import React, { useState } from 'react';
import { Package, RefreshCw, Shield, Clock, Mail, Phone } from 'lucide-react';

const Returns: React.FC = () => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    reason: '',
    productCondition: '',
    refundMethod: 'original'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Return request submitted successfully! We\'ll process your request within 3-5 business days.');
        setFormData({
          orderNumber: '',
          email: '',
          reason: '',
          productCondition: '',
          refundMethod: 'original'
        });
      } else {
        setSubmitMessage(data.message || 'Failed to submit return request. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Returns & Exchanges</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. 
              Learn about our return policy and initiate a return or exchange below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Return Policy */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Return Policy</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Return Window</h3>
                    <div className="text-gray-600 space-y-2">
                      <p><strong>Standard Returns:</strong> 30 days from delivery date</p>
                      <p><strong>Final Sale Items:</strong> 14 days from delivery date</p>
                      <p><strong>Intimate Items:</strong> 7 days from delivery date</p>
                      <p>Items must be unworn, unwashed, and in original packaging.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Eligibility</h3>
                    <div className="text-gray-600 space-y-2">
                      <p>Items purchased in-store or online are eligible for return.</p>
                      <p>Gift receipts are accepted with valid proof of purchase.</p>
                      <p>Items marked as "Final Sale" cannot be exchanged, only returned for store credit.</p>
                      <p>Custom or personalized items are non-returnable unless defective.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Package className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Condition Requirements</h3>
                    <div className="text-gray-600 space-y-2">
                      <p>Items must be in original, unworn condition</p>
                      <p>All original tags and packaging must be intact</p>
                      <p>No signs of wear, damage, or alteration</p>
                      <p>Items with odors, stains, or pet hair will be rejected</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <RefreshCw className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Exchange Policy</h3>
                    <div className="text-gray-600 space-y-2">
                      <p>One-time exchange allowed within 30 days of purchase</p>
                      <p>Price difference will be charged or refunded</p>
                      <p>Exchanges subject to item availability</p>
                      <p>Exchanged items must meet same condition requirements</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Non-Returnable Items</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>• Undergarments and intimate apparel</p>
                      <p>• Items marked as "Final Sale"</p>
                      <p>• Gift cards and vouchers</p>
                      <p>• Custom or personalized items</p>
                      <p>• Perishable items (cosmetics, fragrances)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Initiate Return</h2>
              
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-md ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <p className="font-medium">{submitMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                    placeholder="Enter your order number"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason *
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                    placeholder="Please explain why you're returning this item..."
                  />
                </div>

                <div>
                  <label htmlFor="productCondition" className="block text-sm font-medium text-gray-700 mb-2">
                    Item Condition *
                  </label>
                  <select
                    id="productCondition"
                    name="productCondition"
                    value={formData.productCondition}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                  >
                    <option value="">Select condition...</option>
                    <option value="new-with-tags">New with tags attached</option>
                    <option value="new-without-tags">New without tags</option>
                    <option value="like-new">Like new (worn once)</option>
                    <option value="good">Good (minimal wear)</option>
                    <option value="defective">Defective/Damaged</option>
                    <option value="wrong-item">Wrong item received</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Resolution *
                  </label>
                  <select
                    id="refundMethod"
                    name="refundMethod"
                    value={formData.refundMethod}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                  >
                    <option value="original">Original payment method</option>
                    <option value="store-credit">Store credit</option>
                    <option value="exchange">Exchange for different item</option>
                    <option value="gift-card">Gift card</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#722F37] hover:bg-[#5a2429] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Important Notes</h3>
                  <div className="text-blue-800 space-y-2 text-sm">
                    <p>• Return shipping costs are the customer's responsibility</p>
                    <p>• Original shipping costs are non-refundable</p>
                    <p>• Refunds typically process within 5-7 business days</p>
                    <p>• Store credits are issued immediately upon approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif text-gray-900 mb-6">Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#722F37]" />
                <a 
                  href="mailto:returns@divaskloset.com"
                  className="text-[#722F37] hover:underline font-medium"
                >
                  returns@divaskloset.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#722F37]" />
                <a 
                  href="tel:+2347073994915"
                  className="text-[#722F37] hover:underline font-medium"
                >
                  +234 707 3994 915
                </a>
              </div>
            </div>
            <div className="mt-4 text-gray-600">
              <p>Our customer service team is available Monday - Friday, 9:00 AM - 6:00 PM WAT to assist with any return questions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
