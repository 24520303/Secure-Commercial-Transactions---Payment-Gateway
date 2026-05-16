-- ===== Database cho Payment orchestrator ===== --

CREATE TYPE transaction_status AS ENUM ('requires_payment_method', 'requires_action', 'processing', 'succeeded', 'failed');
CREATE TYPE three_ds_status AS ENUM ('authenticated', 'attempted', 'failed');

CREATE TABLE payment_transactions (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    stripe_payment_intent_id text NOT NULL,
    stripe_payment_method_id text NOT NULL,
    amount bigint NOT NULL,
    currency text NOT NULL,
    
)