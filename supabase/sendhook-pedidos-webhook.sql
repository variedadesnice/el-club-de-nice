-- SendHook: soporte para el flujo de pedidos + webhook.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Es idempotente: se puede
-- correr de nuevo sin romper nada.

-- 1. Idempotencia de los webhooks entrantes.
--    SendHook reintenta una entrega si nuestro 2xx se pierde en la red
--    (1 min, 5 min, 15 min, 1 h, 6 h). Sin esta tabla, un reintento volvería
--    a procesar el mismo evento.
create table if not exists public.sendhook_webhook_events (
    event_id            text primary key,
    event_type          text,
    referencia_externa  text,
    received_at         timestamptz not null default now()
);

create index if not exists sendhook_webhook_events_received_at_idx
    on public.sendhook_webhook_events (received_at desc);

-- El backend entra con la service role key, que salta RLS. Se habilita igual
-- y sin políticas, para que ningún cliente con la anon key pueda leerla.
alter table public.sendhook_webhook_events enable row level security;

-- 2. Trazabilidad pago-a-pedido.
--    `pago_id` es el identificador definitivo del pago del lado de SendHook.
--    Guardarlo es lo único que distingue dos pagos idénticos del mismo
--    cliente (caso típico de Binance, donde no hay referencia bancaria).
alter table public.payments
    add column if not exists sendhook_payment_id bigint;

comment on column public.payments.sendhook_payment_id is
    'ID del pago en SendHook que concilió este registro (null si se aprobó a mano).';
