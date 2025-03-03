// app/api/expenses/route.ts - with null check fix
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, createApiResponse, handleApiError, expenseService, validateExpenseData } from '@/lib/api-service';

// Rate limiting variables
const RATE_LIMIT = 50; // max requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds
const ipRequestMap = new Map<string, { count: number, lastReset: number }>();

// Rate limiting middleware
function checkRateLimit(req: NextRequest) {
  // Get client IP (or fallback to a default in development)
  const ip = req.headers.get('x-forwarded-for') || 'localhost';
  const now = Date.now();
  
  if (!ipRequestMap.has(ip)) {
    ipRequestMap.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  const client = ipRequestMap.get(ip)!;
  
  // Reset counter if window has passed
  if (now - client.lastReset > RATE_WINDOW) {
    client.count = 1;
    client.lastReset = now;
    return true;
  }
  
  // Increment and check
  client.count++;
  if (client.count > RATE_LIMIT) {
    return false;
  }
  
  return true;
}

// GET /api/expenses - Get all expenses for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Fetch expenses for the user
    const { data, error } = await expenseService.getAll(user.id);
    if (error) {
      return handleApiError(error);
    }

    // Return success response
    return createApiResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/expenses - Create a new expense
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    
    // Validate required fields
    const { valid, error: validationError } = validateExpenseData(body);
    if (!valid) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Create expense
    const { data, error } = await expenseService.create(user.id, {
      amount: Number(body.amount),
      category: body.category,
      description: body.description || null,
      date: body.date
    });

    if (error) {
      return handleApiError(error);
    }

    // Return created expense
    return createApiResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}