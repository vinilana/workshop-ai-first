---
type: agent
name: Security Auditor
description: Identify security vulnerabilities
agentType: security-auditor
phases: [R, V]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Workshop Scope Caveat

This is a local workshop project with no authentication, no real payment processing, and no production deployment. Several gaps below are intentional for simplicity — note them, but do not block workshop progress over them.

## Input Validation

`packages/api` uses `class-validator` DTOs with NestJS's `ValidationPipe`. This is correct. Check that every controller method accepting a body or query params uses a typed DTO — bare `@Body() body: any` is a red flag.

`packages/api-core` does no input validation. The `AppService` methods accept raw values and use them in SQL. This is acceptable only because all requests are proxied from the gateway on localhost.

## SQL Injection Prevention

All queries in both packages use `better-sqlite3` parameterized statements (`db.prepare('... WHERE id = ?').get(id)`). There is no string interpolation in SQL — this is correct and injection-safe.

The dynamic WHERE clause in `SqliteProductRepository.findByFilters()` builds conditions as an array and passes values separately, which is also safe.

## CORS

The gateway (`packages/api-gateway/src/main.ts`) should enable CORS for the frontend origins. Check that `app.enableCors()` is called. The backend services (3001, 3002) do not need CORS because they are only called by the gateway, not by the browser directly.

## Authentication

There is no authentication. All endpoints are publicly accessible. This is intentional for the workshop. Do not add auth unless the workshop task explicitly requires it.

## Payment Data

Card numbers are accepted in the payment form but only the last 4 digits are stored. Full card numbers are never persisted — they exist only in memory during `processPayment()`. This is the correct approach.

## Sensitive Data in Errors

`packages/api-core` can throw `Error('Cliente não encontrado: ' + customerId)` with internal IDs in the message. In production these should be generic error messages, but for a local workshop this is acceptable.

## No `.env` Files

There are no secrets or API keys. The gateway configuration uses hardcoded localhost URLs as defaults. Nothing sensitive is in the repository.
