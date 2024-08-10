'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello!! I'm the Mahin your AI Fitness trainer. How can I help you today?",
    },
  ])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setMessages((messages) => [
        ...messages,
        { role: 'user', content: message },
    ]);
    setMessage('');
    setIsLoading(true);

    try {
        console.log("Sending message:", message);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: message })
      });

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        // Ensure the response content is properly formatted
        const formattedContent = data.response
          .replace(/\n/g, '<br/>') // Convert new lines to HTML <br/>
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **bold** to <strong>

        setMessages((messages) => [
            ...messages,
            { role: 'assistant', content: formattedContent }
        ]);
    } catch (error) {
        console.error('Error occurred:', error.message);
        setMessages((messages) => [
            ...messages,
            { role: 'assistant', content: 'Sorry, something went wrong. Please try again later.' }
        ]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
                // Use `dangerouslySetInnerHTML` to render HTML content safely
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown} 
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}