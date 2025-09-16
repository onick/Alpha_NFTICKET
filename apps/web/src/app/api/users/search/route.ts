import { NextRequest, NextResponse } from 'next/server'

// Mock user data - In a real app, this would come from your database
const mockUsers = [
  { id: '1', name: 'María González', username: 'mariag_music', avatar: null },
  { id: '2', name: 'Carlos Rivera', username: 'carlostech', avatar: null },
  { id: '3', name: 'Ana Herrera', username: 'ana_events', avatar: null },
  { id: '4', name: 'Luis Martinez', username: 'luisdjrd', avatar: null },
  { id: '5', name: 'Sofia Ramirez', username: 'sofia_art', avatar: null },
  { id: '6', name: 'Pedro Morales', username: 'pedromorales', avatar: null },
  { id: '7', name: 'Isabella Cruz', username: 'isabellacruz', avatar: null },
  { id: '8', name: 'Miguel Santos', username: 'miguelsantos', avatar: null },
  { id: '9', name: 'Valentina Torres', username: 'valetor', avatar: null },
  { id: '10', name: 'Diego Castillo', username: 'diegocast', avatar: null },
  { id: '11', name: 'Camila Vargas', username: 'camivargs', avatar: null },
  { id: '12', name: 'Sebastian Ruiz', username: 'sebaruiz', avatar: null },
  { id: '13', name: 'Lucia Mendez', username: 'luciamendez', avatar: null },
  { id: '14', name: 'Fernando Silva', username: 'fersilva', avatar: null },
  { id: '15', name: 'Andrea Jimenez', username: 'andreajimenez', avatar: null }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    // Return empty array if no query provided
    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }
    
    // Filter users based on query
    const filteredUsers = mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    )
    
    // Limit results to 5 users and add relevance scoring
    const results = filteredUsers
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      }))
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('User search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}