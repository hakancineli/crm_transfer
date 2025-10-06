import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY', {
      headers: {
        'User-Agent': 'CRM-Transfer-App/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exchange rate API error:', error);
    
    // Fallback rates if API fails
    return NextResponse.json({
      base: 'TRY',
      date: new Date().toISOString().split('T')[0],
      rates: {
        TRY: 1,
        USD: 0.03,
        EUR: 0.03
      }
    });
  }
}