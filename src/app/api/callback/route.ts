import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.redirect(`https://shopeasy.site/invite/success`, 302)
}