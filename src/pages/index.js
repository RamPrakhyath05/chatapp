// src/pages/index.js

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    if (loggedIn) {
      socket.current = io();

      socket.current.emit('login', username);

      socket.current.on('userList', (usersArray) => {
        setUsers(usersArray);
      });

      socket.current.on('message', (data) => {
        setMessages((prev) => [...prev, data]);
      });

      return () => socket.current.disconnect();
    }
  }, [loggedIn]);

  const handleLogin = () => {
    if (username.trim() !== '') setLoggedIn(true);
  };

  const handleSend = () => {
    if (message.trim() !== '') {
      socket.current.emit('message', message);
      setMessage('');
    }
  };

  const handleLogout = () => {
    socket.current.disconnect();
    window.location.reload();
  };

  return (
    <div className="min-h-screen text-white bg-black">
      {!loggedIn ? (
        <div id="loginPage" className="flex items-center justify-center min-h-screen">
          <div id="loginBox" className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-3xl font-semibold mb-4">Login</h2>
            <input
              type="text"
              id="usernameInput"
              className="mb-4 p-2 w-full rounded bg-gray-700 text-white"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              id="loginButton"
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div id="chatPage" className="flex h-screen">
          <div id="userList" className="w-1/4 bg-gray-800 p-6 m-4 rounded-lg shadow-lg overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Users Online</h2>
            <ul>
              {users.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col justify-between p-4 m-4 bg-gray-800 rounded-lg shadow-lg">
            <div id="chatMessages" className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className="bg-gray-700 p-2 rounded">
                  <strong>{msg.username}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              id="messageInput"
              className="mb-2 p-2 w-full rounded bg-gray-700 text-white"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex space-x-2">
              <button
                id="sendButton"
                className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded"
                onClick={handleSend}
              >
                Send
              </button>
              <button
                id="logoutButton"
                className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
