import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import Button from '../ui/Button';

const ChatManager = ({ currentUser, showMsg }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchChats();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.chaId);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        fetchMessages(activeChat.chaId, false);
      }, 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chats');
      const myId = currentUser?.persona?.perId;
      
      const myChats = res.data.filter(c => {
        const compId = typeof c.perIdComprador === 'object' ? c.perIdComprador?.perId : c.perIdComprador;
        const vendId = typeof c.perIdVendedor === 'object' ? c.perIdVendedor?.perId : c.perIdVendedor;
        return compId === myId || vendId === myId;
      });
      
      setChats(myChats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId, showLoad = true) => {
    try {
      if(showLoad && messages.length === 0) setLoading(true);
      const res = await api.get('/mensajes');
      const chatMessages = res.data.filter(m => {
        const cId = typeof m.chaId === 'object' ? m.chaId?.chaId : m.chaId;
        return cId === chatId;
      }).sort((a, b) => new Date(a.menFecha) - new Date(b.menFecha));
      
      setMessages(chatMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await api.post('/mensajes', {
        menTexto: newMessage,
        menFecha: new Date().toISOString(),
        menLeido: false,
        perIdEmisor: { perId: currentUser.persona.perId },
        chaId: { chaId: activeChat.chaId }
      });
      setNewMessage('');
      fetchMessages(activeChat.chaId, false);
    } catch (e) {
      console.error(e);
      showMsg('Error al enviar mensaje', 'error');
    }
  };

  const getChatPartnerName = (chat) => {
    const myId = currentUser?.persona?.perId;
    const compId = typeof chat.perIdComprador === 'object' ? chat.perIdComprador?.perId : chat.perIdComprador;
    
    if (myId === compId) {
      if (typeof chat.negId === 'object') return chat.negId.negNombre;
      return "Negocio";
    } else {
      if (typeof chat.perIdComprador === 'object') return chat.perIdComprador.perNombreCompleto;
      return "Cliente";
    }
  };

  return (
    <div className="flex h-[600px] border border-[var(--border-light)] rounded-xl overflow-hidden bg-[var(--bg-secondary)] animate-fade-in">
      <div className="w-1/3 border-r border-[var(--border-light)] flex flex-col bg-[var(--bg-primary)]">
        <div className="p-4 border-b border-[var(--border-light)]">
          <h3 className="font-bold text-lg text-[var(--text-primary)]">Mensajes</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="p-4 text-center text-secondary">Cargando...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-secondary text-sm">No tienes mensajes aún.</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.chaId} 
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-[var(--border-light)] cursor-pointer transition-colors flex items-center gap-3
                  ${activeChat?.chaId === chat.chaId ? 'bg-[var(--primary-light)] border-l-4 border-l-[var(--primary)]' : 'hover:bg-[var(--bg-secondary)]'}`}
              >
                <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex-center text-primary flex-shrink-0 border border-[var(--border-light)]">
                  <UserIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate text-[var(--text-primary)]">{getChatPartnerName(chat)}</h4>
                  <p className="text-xs text-secondary truncate">Toca para ver la conversación</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-[var(--bg-secondary)]">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-primary)] flex justify-between items-center">
              <h3 className="font-bold text-[var(--text-primary)]">{getChatPartnerName(activeChat)}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map(msg => {
                const myId = currentUser?.persona?.perId;
                const emisorId = typeof msg.perIdEmisor === 'object' ? msg.perIdEmisor?.perId : msg.perIdEmisor;
                const isMine = emisorId === myId;
                
                return (
                  <div key={msg.menId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-lg ${isMine ? 'bg-[var(--primary)] text-white rounded-br-none' : 'bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-bl-none text-[var(--text-primary)]'}`}>
                      <p className="text-sm">{msg.menTexto}</p>
                      <span className={`text-[10px] mt-1 block ${isMine ? 'text-primary-foreground opacity-75' : 'text-secondary'}`}>
                        {new Date(msg.menFecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-primary)]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..." 
                  className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-full text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                <Button type="submit" variant="primary" className="rounded-full px-4 h-auto aspect-square p-0 flex-center">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex-center flex-col text-secondary">
            <MessageCircle size={48} className="opacity-20 mb-4" />
            <p>Selecciona una conversación para empezar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManager;
