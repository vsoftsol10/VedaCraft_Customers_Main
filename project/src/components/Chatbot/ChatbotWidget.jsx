import { useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage } from '../../services/chatApi';
const initialMessages = [
    {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi, I am your Veda Craft assistant. What can I help you find today?',
    },
];
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef(null);
    const openChat = () => {
        setIsOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 100);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextInput = input.trim();
        if (!nextInput || isSending)
            return;
        const userMessage = {
            id: makeId(),
            role: 'user',
            content: nextInput,
        };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput('');
        setIsSending(true);
        try {
            const reply = await sendChatMessage(nextInput, nextMessages.map(({ role, content }) => ({ role, content })));
            setMessages((current) => [
                ...current,
                {
                    id: makeId(),
                    role: 'assistant',
                    content: reply.reply,
                },
            ]);
        }
        catch {
            setMessages((current) => [
                ...current,
                {
                    id: makeId(),
                    role: 'assistant',
                    content: 'Sorry, I could not connect right now. Please try again in a moment.',
                },
            ]);
        }
        finally {
            setIsSending(false);
            window.setTimeout(() => inputRef.current?.focus(), 100);
        }
    };
    return (<div className="fixed bottom-28 right-4 z-[70] sm:bottom-28 sm:right-6">
      {isOpen && (<section className="mb-3 flex h-[min(520px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-green-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20">
                <MessageCircle className="h-5 w-5"/>
              </span>
              <div>
                <h2 className="text-sm font-semibold leading-tight">Veda Assistant</h2>
                <p className="text-xs text-green-50">Online</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 text-white transition hover:bg-white/15" aria-label="Close chat">
              <X className="h-5 w-5"/>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((message) => (<div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${message.role === 'user'
                    ? 'rounded-br-sm bg-green-700 text-white'
                    : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'}`}>
                  {message.content}
                </div>
              </div>))}

            {isSending && (<div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-green-700"/>
                  Thinking
                </div>
              </div>)}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100" placeholder="Ask Veda Craft"/>
            <button type="submit" disabled={!input.trim() || isSending} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300" aria-label="Send message">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
            </button>
          </form>
        </section>)}

      <button type="button" onClick={openChat} className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-white shadow-[0_14px_30px_rgba(21,128,61,0.35)] transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 sm:h-16 sm:w-16" aria-label="Open chat">
        <span className="absolute inset-1 rounded-full border border-white/25"/>
        <MessageCircle className="h-6 w-6 transition group-hover:scale-105 sm:h-7 sm:w-7"/>
        <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-green-700 bg-amber-300 sm:right-2 sm:top-2"/>
      </button>
    </div>);
}
