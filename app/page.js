'use client'

import { Box, Button, Stack, TextField, useMediaQuery } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello!! I'm the Mahin support assistant. How can I help you today?",
    },
  ])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isSmallScreen = useMediaQuery('(max-width:600px)');

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
      p={2}
      sx={{
        // Background
        backgroundImage: 'url("/gym.jpg")', // Replace with your background image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        position: 'relative', 
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.3)', 
          zIndex: -1, 
        }}
      />
      <Stack
        direction={'column'}
        width={isSmallScreen ? "90vw" : "500px"}
        height={isSmallScreen ? "90vh" : "700px"}
        border="2px solid #555" 
        p={2}
        spacing={3}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          borderRadius: '16px',
        }}
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
              alignItems="center"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              sx={{ marginBottom: 1 }}
            >
              {message.role === 'assistant' && (
                <img
                  src="/bot-icon.jpg" 
                  alt="Bot"
                  style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }}
                />
              )}
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main' // Blue color for assistant messages
                    : 'secondary.main'
                }
                color="white"
                borderRadius={8} 
                p={2}
                maxWidth="80%" 
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
              {message.role === 'user' && (
                <img
                  src="/user-icon.jpg" // Path to the user icon image
                  alt="User"
                  style={{ width: 40, height: 40, borderRadius: '50%', marginLeft: 8 }}
                />
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} mt={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', 
                },
                '&:hover fieldset': {
                  borderColor: 'white', 
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', 
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white', 
              },
              '& .MuiInputBase-input': {
                color: 'white', 
              },
            }}
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