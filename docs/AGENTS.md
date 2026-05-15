## Payment Rule

Flutterwave is the primary live payment gateway.

The platform must support Nigerian and foreign-currency payments where Flutterwave/account configuration allows.

Manual payment verification remains as fallback.

Never activate enrollment from callback query status or raw webhook payload alone.

Always verify transaction server-side and confirm:
- payment reference
- amount
- currency
- status
- ownership
- enrollment link

Payment activation must be idempotent.

Every payment phase must follow strict TDD.
