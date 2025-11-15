import { Metadata } from 'next';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Chat with AI Assistant | PajamasWeb',
  description: 'Get instant answers about our services, pricing, and more from our AI assistant.',
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-4">Chat with Our AI Assistant</h1>
            <p className="text-lg text-gray-600 mb-8">
              Get instant answers about our services, pricing, and project requirements.
              Our AI assistant is here to help you 24/7.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-blue-900 mb-3">What can I help with?</h2>
              <ul className="space-y-2 text-blue-800">
                <li>✓ Quick price estimates for your project</li>
                <li>✓ Information about our services and integrations</li>
                <li>✓ Answers to frequently asked questions</li>
                <li>✓ Project timeline and process information</li>
                <li>✓ For clients: Invoice status, upcoming meetings, deliverables</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="font-semibold text-amber-900 mb-3">Important Notes</h2>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li>• Price estimates are approximate and may vary based on specific requirements</li>
                <li>• For detailed quotes, please book a consultation call</li>
                <li>• Client-specific information requires authentication</li>
                <li>• Our team will follow up within 24 hours for complex inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  );
}

