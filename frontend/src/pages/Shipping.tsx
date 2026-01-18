import React from 'react';
import { Package, Truck, Shield, Clock, MapPin, Info, DollarSign, Box } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Shipping Information</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We ship worldwide! Learn about our shipping options, rates, and delivery times.
            </p>
          </div>

          {/* Free Shipping Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-lg mb-12">
            <div className="flex items-center">
              <Truck className="text-3xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold mb-1">Free International Shipping</h2>
                <p className="text-lg">On all orders over $200 USD</p>
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold mb-2">Standard Shipping</h3>
                <p className="text-gray-600 mb-4">7-14 business days</p>
                <p className="text-2xl font-bold text-orange-600">$15 USD</p>
                <p className="text-sm text-gray-500 mt-2">Free on orders over $200</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-2">Express Shipping</h3>
                <p className="text-gray-600 mb-4">3-7 business days</p>
                <p className="text-2xl font-bold text-blue-600">$35 USD</p>
                <p className="text-sm text-gray-500 mt-2">Available worldwide</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-2">Priority Shipping</h3>
                <p className="text-gray-600 mb-4">1-3 business days</p>
                <p className="text-2xl font-bold text-purple-600">$55 USD</p>
                <p className="text-sm text-gray-500 mt-2">Fastest delivery option</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-gray-600 mb-4">7-14 business days</p>
                <p className="text-2xl font-bold text-green-600">FREE</p>
                <p className="text-sm text-gray-500 mt-2">On orders over $200</p>
              </div>
            </div>
          </div>

          {/* Delivery Times by Region */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Estimated Delivery Times</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Region</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Standard</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Express</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium">United States & Canada</td>
                      <td className="px-6 py-4 text-gray-600">5-7 days</td>
                      <td className="px-6 py-4 text-gray-600">2-3 days</td>
                      <td className="px-6 py-4 text-gray-600">1-2 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Europe</td>
                      <td className="px-6 py-4 text-gray-600">7-10 days</td>
                      <td className="px-6 py-4 text-gray-600">3-5 days</td>
                      <td className="px-6 py-4 text-gray-600">2-3 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Asia Pacific</td>
                      <td className="px-6 py-4 text-gray-600">10-14 days</td>
                      <td className="px-6 py-4 text-gray-600">5-7 days</td>
                      <td className="px-6 py-4 text-gray-600">3-5 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Africa & Middle East</td>
                      <td className="px-6 py-4 text-gray-600">12-18 days</td>
                      <td className="px-6 py-4 text-gray-600">7-10 days</td>
                      <td className="px-6 py-4 text-gray-600">5-7 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Latin America</td>
                      <td className="px-6 py-4 text-gray-600">10-15 days</td>
                      <td className="px-6 py-4 text-gray-600">5-8 days</td>
                      <td className="px-6 py-4 text-gray-600">3-5 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Important Information</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Info className="text-orange-500 mr-3" />
                  Processing Time
                </h3>
                <p className="text-gray-600">All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Box className="text-orange-500 mr-3" />
                  Order Tracking
                </h3>
                <p className="text-gray-600">Once your order ships, you'll receive a tracking number via email. You can track your package in real-time using our tracking system.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <DollarSign className="text-orange-500 mr-3" />
                  Customs & Duties
                </h3>
                <p className="text-gray-600">International orders may be subject to customs fees and import duties. These charges are the responsibility of the customer and are not included in the shipping cost.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Shield className="text-orange-500 mr-3" />
                  Package Insurance
                </h3>
                <p className="text-gray-600">All orders are fully insured during transit. If your package is lost or damaged, please contact us immediately and we'll resolve the issue.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold mb-2">How do I track my order?</h3>
                <p className="text-gray-600">You'll receive a tracking number via email once your order ships. Click the tracking link in the email or enter your tracking number on our website.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold mb-2">What if my package is delayed?</h3>
                <p className="text-gray-600">Delivery times are estimates and may vary due to customs processing, weather, or other factors. If your package is significantly delayed, please contact our customer service team.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold mb-2">Can I change my shipping address?</h3>
                <p className="text-gray-600">You can change your shipping address within 24 hours of placing your order by contacting customer service. After that, changes may not be possible if the order has already shipped.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you ship to PO boxes?</h3>
                <p className="text-gray-600">Yes, we ship to PO boxes using standard shipping. Express and Priority shipping options require a physical address.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
