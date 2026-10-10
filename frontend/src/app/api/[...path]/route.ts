import { NextRequest, NextResponse } from "next/server";

const backendUrl = (process.env.BACKEND_API_URL || "http://localhost:3001").replace(
  /\/+$/,
  ""
);

const forward = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const target = `${backendUrl}/api/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "BrainSnack API is unavailable. Start the backend and try again." },
      { status: 503 }
    );
  }
};

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
