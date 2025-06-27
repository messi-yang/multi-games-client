import { useState, useRef, useEffect } from 'react';
import { MessageModel } from '@/models/message/message-model';
import { Input } from '@/components/inputs/input';

type Props = {
  messages: MessageModel[];
  onSendMessage: (message: string) => void;
};

export function ChatBox({ messages, onSendMessage }: Props) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((message) => (
          <div key={message.getId()} className="flex flex-col gap-2">
            <div className="font-bold text-sm text-white/90">{message.getPlayerName()}</div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 inline-block max-w-[80%] text-white/80 shadow-lg">
              {message.getContent()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/20 p-4">
        <div className="flex flex-col gap-2">
          <Input value={inputValue} onInput={(value) => setInputValue(value)} placeholder="Type a message..." />
          <button
            type="submit"
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors shadow-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
