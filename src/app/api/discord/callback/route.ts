import { NextResponse } from 'next/server'
import axios, { isAxiosError } from 'axios'

export async function GET(req: Request) {

  try {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  // const plan  = searchParams.get('state')
  if (!code) return NextResponse.next({ status: 400 })

  const params = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type:    'authorization_code',
    code,
    redirect_uri:  `${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/callback`
  })

  const { data: token } = await axios.post(
    'https://discord.com/api/oauth2/token',
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const user = (await axios.get(
    'https://discord.com/api/users/@me',
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  )).data

  const guildId = process.env.DISCORD_GUILD_ID!

  let memberExists = true
  try {
    await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
  } catch (err: unknown) {
  if (isAxiosError(err) && err.response?.status === 404) {
    memberExists = false;
  } else {
    throw err;
  }
}


  if (!memberExists) {
    await axios.put(
      `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
      { access_token: token.access_token },
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
  }

  const dm = (await axios.post(
    'https://discord.com/api/v10/users/@me/channels',
    { recipient_id: user.id },
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  )).data

await axios.post(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
  embeds: [{
    description: `## <:noway:1375493883810812064> Planos Indiponiveis\n\n> Os planos estão indisponiveis para venda temporariamente, em breve estarão disponiveis novamente!\n\n-# Qualquer duvida acesse o servidor de suporte!`,    color: 0xff0000
  }],
  components: [{
    type: 1,
    components: [{
      type: 2,
      style: 5,
      label: "🔗 Acompanhar no Servidor",
      url: "https://shopeasy.site/support"
    }]
  }]
}, {
  headers: {
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json"
  }
});


  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/invite/auth/success`)
} catch(error) {
   return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/discord`)
};

}
