import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, createApiResponse, handleApiError, expenseService, validateExpenseData } from '@/lib/api-service';

// Define the correct type for async route parameters
interface RouteContext {
  params: { id: string };
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params; // Directly use params since Next.js now supports async API natively

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();

    // Validate fields
    const { valid, error: validationError } = validateExpenseData(body);
    if (!valid) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Update expense
    const { data, error } = await expenseService.update(user.id, id, {
      amount: Number(body.amount),
      category: body.category,
      description: body.description || null,
      date: body.date,
    });

    if (error) {
      return handleApiError(error);
    }

    // Return updated expense
    return createApiResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    // Get authenticated user
    const { user, error: authError } = await getUserFromToken(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication required' }, { status: 401 });
    }

    // Delete expense
    const { success, error } = await expenseService.delete(user.id, id);

    if (error) {
      return handleApiError(error);
    }

    // Return success response
    return createApiResponse({ message: 'Expense deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
