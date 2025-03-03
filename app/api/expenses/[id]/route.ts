import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Income } from '@/types/income'; // Import your Income type

// Initialize Supabase client (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await the params Promise to access the id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('income') // Matches your table name (singular)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Income not found' }, { status: 404 });
  }
  return NextResponse.json<Income>(data, { status: 200 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await the params Promise to access the id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { amount, description, date } = body;
  const updates: Partial<Income> = {};
  if (amount !== undefined) updates.amount = amount;
  if (description !== undefined) updates.description = description;
  if (date) updates.date = date;

  const { data, error } = await supabase
    .from('income') // Matches your table name (singular)
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error || !data) {
    return NextResponse.json({ error: 'Income not found' }, { status: 404 });
  }
  return NextResponse.json<Income>(data[0], { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await the params Promise to access the id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('income') // Matches your table name (singular)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Income not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}