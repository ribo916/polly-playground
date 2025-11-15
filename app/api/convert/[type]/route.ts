import { NextRequest, NextResponse } from 'next/server';
import {
  uiToExternalPricingScenario,
  getLoanToExternalPricingScenario,
  externalToGetLoan
} from '@/utils/polly-converter';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> | { type: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { type } = resolvedParams;
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be a valid JSON object'
        },
        { status: 400 }
      );
    }

    let converted;

    switch (type) {
      case 'ui-to-external':
        converted = uiToExternalPricingScenario(body);
        break;
      case 'getloan-to-external':
        converted = getLoanToExternalPricingScenario(body);
        break;
      case 'external-to-getloan':
        converted = externalToGetLoan(body);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown conversion type: ${type}`
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: converted
    });
  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Conversion failed',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Polly converter API is running',
    conversions: [
      'ui-to-external',
      'getloan-to-external',
      'external-to-getloan'
    ]
  });
}

