---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Security Posture

DOM Pagamentos is a **workshop and demo project**. It is not intended for production use and does not implement production-grade security controls. The notes below document the current state and the rationale.

## Authentication and Authorization

**There is no authentication or authorization.** All API endpoints are publicly accessible with no credentials required. This is intentional for the workshop context, where the focus is on architecture and payment flow patterns rather than identity management.

If this project were hardened for production, the expected additions would be:
- JWT-based authentication on the API Gateway
- Role-based access control for admin vs. customer endpoints
- Session tokens for checkout flows

## Secrets Management

**No secrets management is required.** The project has no API keys, third-party service credentials, or sensitive configuration. There is no `.env` file with sensitive values. All configuration (ports, DB path) is either hardcoded as constants or relies on defaults.

## Database

The SQLite database file is stored locally at `data/dom-pagamentos.sqlite`. It is a local file with no network exposure. WAL (Write-Ahead Logging) mode is enabled for performance.

No database credentials are required. Access control relies entirely on filesystem permissions.

## Input Validation

All incoming request bodies are validated using `class-validator` decorators on NestJS DTOs in the presentation layer of `packages/api`. Invalid input is rejected before reaching business logic.

Example validators in use:
- `@IsString()`, `@IsNotEmpty()` on required string fields
- `@IsArray()`, `@ArrayMinSize(1)` on line item arrays
- `@IsEnum(PaymentMethodType)` on payment method type fields

## Error Handling

An `HttpExceptionFilter` is registered globally in NestJS applications. It catches all unhandled exceptions and formats them as a consistent `ApiResponse` envelope with an `error` field, preventing raw stack traces from leaking to clients.

## Payment Data

Card details stored in the database use a `CardDetails` model that only holds masked data (`last4`, `brand`, `expiry`). No full card numbers (PANs) are stored or transmitted anywhere in the system. This is consistent with PCI-DSS principles even in a demo context.

## Dependency Security

No automated dependency scanning is configured. For a workshop project this is acceptable. Before any production adaptation, a tool such as `npm audit` or Dependabot should be enabled.
