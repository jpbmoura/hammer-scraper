"use client";

import { useState, useEffect } from "react";

const LoadingMessages = () => {
  const messages = [
    "Carregando dados...",
    "Deixe de aperreio...",
    "Calma Erick...",
    "Finalizando, otário...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-20 text-lg animate-pulse">
      {messages[messageIndex]}
    </div>
  );
};

export default LoadingMessages;
