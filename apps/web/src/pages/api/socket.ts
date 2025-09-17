import { NextApiRequest } from 'next'
import { initializeSocketIO, NextApiResponseServerIO } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('🔧 Setting up Socket.IO server...')
    const io = initializeSocketIO(res.socket.server)
    res.socket.server.io = io
  } else {
    console.log('✅ Socket.IO server already running')
  }
  
  res.end()
}