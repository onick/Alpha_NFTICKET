import { NextRequest, NextResponse } from 'next/server'
import { createServerOrdersService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const ordersService = createServerOrdersService(cookieStore)
    
    const order = await ordersService.createPendingOrder(body)
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order API error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const cookieStore = cookies()
    const ordersService = createServerOrdersService(cookieStore)
    
    const orders = await ordersService.getUserOrders(userId, limit)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}