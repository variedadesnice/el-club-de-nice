-- Binance P2P: guardar el nombre de quien envía el pago.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Es idempotente.
--
-- Binance no reporta ni número de referencia ni teléfono real, así que el
-- nombre del remitente en la orden P2P es el ÚNICO dato con el que se puede
-- distinguir un pago de otro. Hasta ahora se usaba el nombre con el que la
-- persona creó su cuenta, que no tiene por qué coincidir con el suyo en
-- Binance; esta columna guarda el que declara en el formulario de pago.
--
-- Para Pago Móvil (BDV, BNC, BFC) la columna simplemente queda vacía: esos
-- métodos se verifican por referencia o por teléfono.

alter table public.payments
    add column if not exists payer_name text;

comment on column public.payments.payer_name is
    'Nombre de quien envía el pago, tal como lo ve el receptor. Se usa para verificar pagos de Binance P2P.';
