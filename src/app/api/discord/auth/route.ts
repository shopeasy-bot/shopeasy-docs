import { NextResponse } from 'next/server'

export function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const plan = searchParams.get('plan')
  const redirect_uri =  `${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/callback`


  const url =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${process.env.DISCORD_CLIENT_ID}` +
    `&scope=identify%20guilds.join` +
    `&permissions=2048` +
    `&response_type=code` +
    `&redirect_uri=${redirect_uri}` +
    `&state=${plan}`
  return NextResponse.redirect(url)
}
