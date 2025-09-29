import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Honeypot validation
    if (formData.website && formData.website.trim() !== '') {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Timing validation (prevent too fast submissions)
    if (Date.now() - formData.timestamp < 3000) {
      return NextResponse.json({ error: 'Too fast' }, { status: 400 });
    }

    // Server-side validation
    const errors = [];

    if (!formData.email) errors.push('Email is required');
    if (!formData.departureDate) errors.push('Departure date is required');
    if (!formData.returnDate) errors.push('Return date is required');
    if (!formData.budget && !formData.customBudget) errors.push('Budget is required');
    if (!formData.flexibility) errors.push('Flexibility is required');
    if (!formData.travelType) errors.push('Travel type is required');

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(formData.departureDate);
    const retDate = new Date(formData.returnDate);

    if (depDate < today) errors.push('Departure date cannot be in the past');
    if (retDate < today) errors.push('Return date cannot be in the past');
    if (retDate <= depDate) errors.push('Return date must be after departure date');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }

    // Budget validation
    if (formData.customBudget && parseInt(formData.customBudget) < 100) {
      errors.push('Minimum budget is €100');
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Generate a unique ID for this submission
    const submissionId = `intake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send to external APIs
    // 3. Trigger email notifications
    // 4. Process data for matching algorithm

    console.log('Intake submission received:', {
      id: submissionId,
      email: formData.email,
      travelType: formData.travelType,
      budget: formData.budget || formData.customBudget,
      dates: {
        departure: formData.departureDate,
        return: formData.returnDate
      },
      travelers: {
        adults: formData.adults,
        children: formData.children,
        childrenAges: formData.childrenAges
      },
      flexibility: formData.flexibility
    });

    // Mock success response
    return NextResponse.json({
      success: true,
      id: submissionId,
      message: 'Intake successfully submitted'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST method to submit intake data' });
}