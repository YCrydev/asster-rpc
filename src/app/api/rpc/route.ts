import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ASSTER_RPC_URL = 'http://18.220.17.102/';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(ASSTER_RPC_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('RPC Proxy Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return NextResponse.json(
          { error: `HTTP ${error.response.status}: ${error.response.statusText}` },
          { status: error.response.status }
        );
      } else if (error.request) {
        return NextResponse.json(
          { error: 'Network error - no response received' },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '';
    
    const response = await axios.get(`${ASSTER_RPC_URL}${endpoint}`, {
      timeout: 5000,
    });

    return new NextResponse(response.data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers['content-type'] || 'text/plain',
      },
    });
  } catch (error) {
    console.error('RPC Proxy Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return NextResponse.json(
          { error: `HTTP ${error.response.status}: ${error.response.statusText}` },
          { status: error.response.status }
        );
      } else if (error.request) {
        return NextResponse.json(
          { error: 'Network error - no response received' },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 