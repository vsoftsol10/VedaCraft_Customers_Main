import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Phone, Mail, X, Send, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
const faqs = [
    {
        q: 'How can I track my order?',
        a: 'Once your order is shipped, you will receive a tracking link via SMS and email. You can also check the "My Orders" section in your profile.',
    },
    {
        q: 'What is the return policy?',
        a: 'We offer a 7-day return policy for most products. Items must be in their original condition and packaging. Visit the order details page to initiate a return.',
    },
    {
        q: 'How do I cancel an order?',
        a: 'Orders can be cancelled within 24 hours of placing them. Go to My Orders, select the order, and tap "Cancel Order".',
    },
    {
        q: 'Are the products on Vedacraft authentic?',
        a: 'Yes! All products are sourced directly from verified artisans and local farmers. We guarantee authenticity and quality.',
    },
];
// Simple bot response logic
function getBotReply(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('track') || lower.includes('order status'))
        return 'You can track your order from the "My Orders" section in your profile. A tracking link is also sent to your registered email & SMS. 📦';
    if (lower.includes('return') || lower.includes('refund'))
        return 'We have a 7-day easy return policy. Just go to My Orders → Select the order → Tap "Return". Refunds are processed within 3-5 business days. 💚';
    if (lower.includes('cancel'))
        return 'Orders can be cancelled within 24 hours. Go to My Orders → Select the order → Tap "Cancel Order". Need help with a specific order? 🛒';
    if (lower.includes('payment') || lower.includes('pay'))
        return 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery. All payments are 100% secure. 🔒';
    if (lower.includes('deliver') || lower.includes('shipping'))
        return 'We deliver across India! Standard delivery takes 3-7 business days. Free shipping on orders above ₹499. 🚚';
    if (lower.includes('authentic') || lower.includes('genuine') || lower.includes('quality'))
        return 'All Veda Craft products are sourced directly from verified artisans and local farmers. Every product is quality-checked before dispatch. 🌿';
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('namaste'))
        return 'Namaste! 🙏 I am the VedaCraft Assistant. How can I help you today? You can ask me about orders, returns, payments, or anything else!';
    if (lower.includes('thank'))
        return 'You are welcome! Is there anything else I can help you with? 😊';
    if (lower.includes('contact') || lower.includes('human') || lower.includes('agent'))
        return 'To speak with a human agent, you can call us at +91 98765 43210 or email support@vedacraft.in. We are available Mon–Sat, 9 AM – 6 PM. 📞';
    return 'Thank you for reaching out! I did not quite understand that. Could you please rephrase? You can ask about orders, returns, payments, shipping, or product authenticity. 😊';
}
function getTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (<div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5 text-left
                   hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium text-gray-800">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
      </button>
      {open && (<div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
          <p className="pt-3">{a}</p>
        </div>)}
    </div>);
}
function ChatWindow({ onClose }) {
    const [messages, setMessages] = useState([
        {
            from: 'bot',
            text: 'Namaste! 🙏 I am your VedaCraft Assistant. How can I help you today? Ask me anything about your orders, returns, payments, or shipping!',
            time: getTime(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);
    const handleSend = () => {
        const text = input.trim();
        if (!text)
            return;
        const userMsg = { from: 'user', text, time: getTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            const botMsg = { from: 'bot', text: getBotReply(text), time: getTime() };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 500);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter')
            handleSend();
    };
    const quickReplies = ['Track my order', 'Return policy', 'Payment options', 'Talk to human'];
    return (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:w-[380px] h-[85vh] sm:h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-green-100 animate-fade-in">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">VedaCraft Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"/>
              <span className="text-green-100 text-xs">Online • Replies instantly</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white"/>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (<div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.from === 'bot' ? 'bg-green-100' : 'bg-gray-200'}`}>
                {msg.from === 'bot'
                ? <Bot className="w-4 h-4 text-green-600"/>
                : <User className="w-4 h-4 text-gray-600"/>}
              </div>
              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'user'
                ? 'bg-green-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            </div>))}

          {/* Typing indicator */}
          {isTyping && (<div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-green-600"/>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>)}
          <div ref={bottomRef}/>
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100 bg-white">
          {quickReplies.map((qr) => (<button key={qr} onClick={() => { setInput(qr); }} className="flex-shrink-0 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 hover:bg-green-100 transition-colors">
              {qr}
            </button>))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all"/>
          <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0">
            <Send className="w-4 h-4 text-white"/>
          </button>
        </div>
      </div>
    </div>);
}
export default function HelpSupport() {
    const [chatOpen, setChatOpen] = useState(false);
    return (<div className="flex flex-col gap-4">
      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-5 h-5 text-[#2d6a2d]"/>
          <h3 className="text-base font-semibold text-gray-900">Frequently Asked Questions</h3>
        </div>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (<FaqItem key={i} q={faq.q} a={faq.a}/>))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Us</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Live Chat - clickable */}
          <div onClick={() => setChatOpen(true)} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-blue-100 bg-blue-50/40
                       hover:border-blue-300 hover:shadow-md cursor-pointer transition-all text-center group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors relative">
              <MessageSquare className="w-5 h-5"/>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>
            </div>
            <p className="text-sm font-semibold text-gray-800">Live Chat</p>
            <p className="text-xs text-blue-500 font-medium">VedaCraft Assistant</p>
          </div>

          {/* Call Us */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100
                         hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-green-600 bg-green-50">
              <Phone className="w-5 h-5"/>
            </div>
            <p className="text-sm font-semibold text-gray-800">Call Us</p>
            <p className="text-xs text-gray-400">+91 98765 43210</p>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100
                         hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-yellow-600 bg-yellow-50">
              <Mail className="w-5 h-5"/>
            </div>
            <p className="text-sm font-semibold text-gray-800">Email</p>
            <p className="text-xs text-gray-400">support@vedacraft.in</p>
          </div>
        </div>
      </div>

      {/* VedaCraft Chat Window */}
      {chatOpen && <ChatWindow onClose={() => setChatOpen(false)}/>}
    </div>);
}
