import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserFromToken, 
  createApiResponse, 
  handleApiError, 
  expenseService, 
  validateExpenseData 
} from '@/lib/api-service';

export async function PUT(req: NextRequest) {
  try {
    // Retrieve `id` from the request URL
    const id = req.nextUrl.pathname.split('/').pop(); 

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

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

    return createApiResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Retrieve `id` from the request URL
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

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

    return createApiResponse({ message: 'Expense deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
