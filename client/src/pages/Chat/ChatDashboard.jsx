import { useState, useEffect } from 'react';
import { Send, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Placeholder for chat logic
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, { id: Date.now(), text: newMessage, sender: 'me' }]);
    setNewMessage('');
  };

  return (
    <div className="container py-8 h-[calc(100vh-12rem)] min-h-[600px]">
      <div className="flex gap-6 h-full">
        {/* Chat List */}
        <Card className="w-1/3 h-full hidden md:flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--glass-border)]">
            <h2 className="text-xl font-bold mb-4">Mensajes</h2>
            <Input icon={Search} placeholder="Buscar chat..." />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* Contact Item Placeholder */}
            <div className="p-3 rounded-lg bg-[var(--glass-bg-hover)] cursor-pointer mb-2 border border-[var(--primary)]">
              <div className="font-medium">Panadería "El Sol"</div>
              <div className="text-sm text-secondary truncate">¿A qué hora abren mañana?</div>
            </div>
          </div>
        </Card>

        {/* Active Chat */}
        <Card className="flex-1 h-full flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]">
            <div className="font-bold text-lg">Panadería "El Sol"</div>
            <div className="text-sm text-secondary">Responde usualmente en 1 hora</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="self-start max-w-[70%] bg-[var(--bg-secondary)] p-3 rounded-2xl rounded-tl-none border border-[var(--glass-border)]">
              <p>Hola, ¿A qué hora abren mañana?</p>
            </div>
            {messages.map(m => (
              <div key={m.id} className="self-end max-w-[70%] bg-[var(--primary)] text-white p-3 rounded-2xl rounded-tr-none shadow-lg">
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--glass-border)]">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                className="flex-1" 
                placeholder="Escribe un mensaje..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" variant="primary" className="px-4">
                <Send size={20} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatDashboard;
