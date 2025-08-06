import { NextRequest, NextResponse } from 'next/server';
import * as oidc from 'oidc-provider';

const provider = new oidc.Provider('http://localhost:3000', {
  clients: [
    {
      client_id: 'foo',
      client_secret: 'bar',
      redirect_uris: ['http://localhost:8080/cb'],
    },
  ],
});

const handler = async (req: NextRequest) => {
  try {
    // Create a promise to handle the oidc-provider callback
    const response = await new Promise<Response>((resolve, reject) => {
      // Mock Node.js request and response objects for oidc-provider
      const nodeReq = {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        body: req.body,
      };

      let responseData = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: '',
      };

      const nodeRes = {
        statusCode: 200,
        setHeader: (name: string, value: string) => {
          responseData.headers[name] = value;
        },
        writeHead: (statusCode: number, headers?: Record<string, string>) => {
          responseData.statusCode = statusCode;
          if (headers) {
            Object.assign(responseData.headers, headers);
          }
        },
        write: (chunk: string) => {
          responseData.body += chunk;
        },
        end: (chunk?: string) => {
          if (chunk) responseData.body += chunk;
          resolve(new Response(responseData.body, {
            status: responseData.statusCode,
            headers: responseData.headers,
          }));
        },
      };

      // Get the OIDC provider callback middleware
      const callback = provider.callback();
      callback(nodeReq as any, nodeRes as any, (err?: Error) => {
        if (err) {
          reject(err);
        } else if (!responseData.body) {
          // If no response was sent, send a default response
          resolve(new Response('OK', { status: 200 }));
        }
      });
    });

    return response;
  } catch (error) {
    console.error('OIDC Provider error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
