// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role to have admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/auth/signup - Register a new user
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create the user
    const { data: userData, error: signupError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm the email
      user_metadata: {
        full_name: name,
      },
    });

    if (signupError) {
      console.error('Signup error:', signupError);
      return NextResponse.json(
        { error: signupError.message },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata.full_name,
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Server error during signup:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}