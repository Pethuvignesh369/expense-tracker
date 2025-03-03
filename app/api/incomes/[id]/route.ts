import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, createApiResponse, handleApiError, incomeService, validateIncomeData } from '@/lib/api-service';

// PUT /api/incomes/[id] - Update an income
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to access the id asynchronously
    const { id } = await params;

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();

    // Validate fields
    const { valid, error: validationError } = validateIncomeData(body);
    if (!valid) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Update income
    const { data, error } = await incomeService.update(user.id, id, {
      amount: Number(body.amount),
      description: body.description || null,
      date: body.date,
    });

    if (error) {
      return handleApiError(error);
    }

    // Return updated income
    return createApiResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/incomes/[id] - Delete an income
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to access the id asynchronously
    const { id } = await params;

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Delete income
    const { success, error } = await incomeService.delete(user.id, id);

    if (error) {
      return handleApiError(error);
    }

    // Return success response
    return createApiResponse({ message: 'Income deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}