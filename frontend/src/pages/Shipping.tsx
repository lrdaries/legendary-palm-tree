import React from 'react';
import { Package, Truck, Shield, Clock, MapPin } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Shipping & Delivery</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We want to ensure your order arrives safely and on time. 
              Find our shipping policies and delivery options below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Shipping Policy */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Shipping Policy</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Truck className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Processing Time</h3>
                    <p className="text-gray-600">Orders are processed within 1-2 business days.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Package className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Shipping Methods</h3>
                    <div className="text-gray-600 space-y-2">
                      <p><strong>Standard Shipping:</strong> 5-7 business days</p>
                      <p><strong>Express Shipping:</strong> 2-3 business days</p>
                      <p><strong>International Shipping:</strong> 7-14 business days</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Shipping Costs</h3>
                    <div className="text-gray-600 space-y-2">
                      <p>Free shipping on orders over ₦50,000</p>
                      <p>Standard shipping: ₦2,000 - ₦4,999</p>
                      <p>Express shipping: ₦5,000 - ₦9,999</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Delivery Areas</h3>
                    <div className="text-gray-600">
                      <p>We deliver to all major cities in Nigeria:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Lagos (Mainland & Island)</li>
                        <li>Abuja</li>
                        <li>Port Harcourt</li>
                        <li>Kano</li>
                        <li>Ibadan</li>
                        <li>Benin City</li>
                        <li>Warri</li>
                        <li>Enugu</li>
                        <li>Owerri</li>
                        <li>Akure</li>
                        <li>Jos</li>
                        <li>Kaduna</li>
                        <li>Zaria</li>
                        <li>Minna</li>
                        <li>Bauchi</li>
                        <li>Gombe</li>
                        <li>Yola</li>
                        <li>Oyo</li>
                        <li>Ilọrin</li>
                        <li>Ekiti</li>
                        <li>Ado Ekiti</li>
                        <li>Afijio</li>
                        <li>Delta</li>
                        <li>Bayelsa</li>
                        <li>Rivers</li>
                        <li>Edo</li>
                        <li>Benue</li>
                        <li>Kogi</li>
                        <li>Kwara</li>
                        <li>Nasarawa</li>
                        <li>Jigawa</li>
                        <li>Potiskum</li>
                      </ul>
                      <p className="mt-2 text-sm text-gray-500">International delivery available for select countries. Contact us for rates.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Order Tracking</h3>
                    <div className="text-gray-600 space-y-2">
                      <p>Once your order ships, you'll receive a tracking number via email.</p>
                      <p>Track your order on our website or contact customer service for updates.</p>
                      <p>Estimated delivery times are business days and exclude weekends and holidays.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Delivery Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Truck className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Delivery Times</h3>
                    <div className="text-gray-600">
                      <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                      <p><strong>Saturday:</strong> 10:00 AM - 5:00 PM</p>
                      <p><strong>Sunday:</strong> Closed</p>
                      <p><strong>Holidays:</strong> We observe major Nigerian holidays and will notify customers of any delivery delays.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Package className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Package Handling</h3>
                    <div className="text-gray-600">
                      <p>All items are carefully packaged to prevent damage during transit.</p>
                      <p>High-value items may require signature upon delivery.</p>
                      <p>Customers can request special packaging for gifts at additional cost.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Delivery Confirmation</h3>
                    <div className="text-gray-600">
                      <p>You'll receive an email confirmation when your order ships.</p>
                      <p>Our delivery team will call you before delivery for large orders.</p>
                      <p>Photo confirmation may be requested for high-value deliveries.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-[#722F37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Pickup Option</h3>
                    <div className="text-gray-600">
                      <p>Local pickup available in Lagos only.</p>
                      <p>Ready within 24 hours of order confirmation.</p>
                      <p>Photo ID required for pickup.</p>
                      <p>Free pickup for orders over ₦100,000.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-gray-600 mb-4">
                      Our customer service team is here to help with any questions about shipping or delivery.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="mailto:support@divaskloset.com"
                        className="flex items-center justify-center px-6 py-3 border border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37]"
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Email Support
                      </a>
                      <a 
                        href="tel:+2347073994915"
                        className="flex items-center justify-center px-6 py-3 border border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37]"
                      >
                        <Truck className="w-5 h-5 mr-2" />
                        Call Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
