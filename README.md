# Julio's Hot Dog

Aplicacao Node.js/Express com Supabase e WhatsApp Cloud API.

## Como preparar

1. Rode `sql/schema.sql` no SQL Editor do Supabase.
2. Copie `.env.example` para `.env`.
3. Preencha as variaveis do Supabase e WhatsApp.
4. Rode `npm install`.
5. Inicie com `npm start`.

## Variaveis principais

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SESSION_SECRET=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=julios_webhook_2026
JULIUS_WHATSAPP_NUMBER=
DELIVERY_FEE=5
```

## Webhook WhatsApp

Configure na Meta:

```text
https://SUA_URL_PUBLICA/api/whatsapp/webhook
```

Verify token:

```text
julios_webhook_2026
```

Assine o evento `messages`.

## Fluxo

- Usuario precisa estar logado para acessar o site.
- Usuario monta o carrinho e finaliza.
- Backend envia pedido ao WhatsApp do Julius com botoes Aceitar/Negar.
- Aceitar cria o pedido no banco e debita estoque.
- Negar marca a solicitacao como negada.

## Deploy no Render

O arquivo `render.yaml` ja esta preparado. Conecte este projeto a um repositorio GitHub e crie um Blueprint no Render.
