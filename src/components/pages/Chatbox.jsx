import React, { useState, useEffect, useRef } from 'react';

const Chatbox = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn tới Hugging Face API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`, // Lấy API Key từ .env
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: input, // Hugging Face dùng "inputs" thay vì "messages"
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.generated_text || 'Tôi không hiểu, bạn có thể hỏi lại không?',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại!';
      if (error.message.includes('429')) {
        errorMessage = 'Đã vượt quá giới hạn yêu cầu miễn phí. Thử lại sau!';
      } else if (error.message.includes('401')) {
        errorMessage = 'API Key không hợp lệ. Kiểm tra lại!';
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
        {/* Danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {messages
            .filter((msg) => msg.role !== 'system') // Ẩn tin nhắn hệ thống
            .map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          {isLoading && (
            <div className="text-gray-500 text-center">Đang xử lý...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form nhập tin nhắn */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbox;