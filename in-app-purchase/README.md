# OnlyPays — In-App Purchase Service

Spring Boot microservice responsible for in-app currency (Opux/Opx) management and payment gateway integration.

- **HTTP Port**: `8081`
- **PostgreSQL Port**: `5432`
- **JDWP Remote Debug Port**: `5005`
- **DevTools LiveReload Port**: `35729`
- **Java**: 21 (Eclipse Temurin)
- **Framework**: Spring Boot
- **Database**: PostgreSQL with Flyway migrations & Spring Data JPA

---

## 🗄️ Database Architecture & Schema

This service owns a dedicated PostgreSQL database instance (`onlypays_iap`) managed via Flyway migrations.

### Schema Tables

1. **`idempotency_keys`**: Prevents duplicate charges/operations across all mutation APIs (24h TTL, `request_hash` verification, `response_snapshot` caching).
2. **`outbox_events`**: Transactional Outbox Pattern for guaranteed at-least-once Kafka event delivery with saga tracing (`correlation_id`, `causation_id`).
3. **`wallets`**: User wallets tracking spendable (`balance_opx`) and locked (`reserved_opx`) balances with optimistic concurrency control (`version`).
4. **`transactions`**: Immutable, append-only financial ledger with balance snapshots (`balance_before_opx`, `balance_after_opx`).
5. **`payment_intents`**: Top-up sessions tracking Stripe PaymentIntent status transitions.
6. **`payouts`**: Creator payout requests tracking Stripe Connect transfers.

### Package Structure

```
com.onlypays.in_app_purchase
├── InAppPurchaseApplication.java
├── controller
│   └── TestController.java
└── domain
    ├── idempotency
    │   ├── IdempotencyKey.java
    │   ├── IdempotencyKeyRepository.java
    │   └── IdempotencyStatus.java
    ├── outbox
    │   ├── OutboxEvent.java
    │   ├── OutboxEventRepository.java
    │   └── OutboxStatus.java
    ├── payment
    │   ├── PaymentIntent.java
    │   ├── PaymentIntentRepository.java
    │   └── PaymentIntentStatus.java
    ├── payout
    │   ├── Payout.java
    │   ├── PayoutRepository.java
    │   └── PayoutStatus.java
    ├── transaction
    │   ├── TransactionRepository.java
    │   ├── TransactionStatus.java
    │   ├── TransactionType.java
    │   └── WalletTransaction.java
    └── wallet
        ├── Wallet.java
        └── WalletRepository.java
```

---

## 🚀 Development with Live Hot Reloading

This service is configured with **Spring Boot DevTools**, **PostgreSQL (`postgres-iap`)**, and an **in-container file watcher (`inotify-tools`)** to provide instant hot reloading on source and resource modifications.

### 1. Start the Stack (PostgreSQL + Service)

```powershell
# From backend/in-app-purchase:
docker compose up -d

# Stream application logs
docker compose logs -f development
```

### 2. Verify Service & Database

```powershell
curl http://localhost:8081/api/v1/test/ping
```

Response:
```json
{
  "status": "UP",
  "service": "in-app-purchase",
  "message": "In-App Purchase Service is operational with live hot reloading enabled!",
  "timestamp": "2026-10-21T09:29:23Z"
}
```

### 3. How Hot Reloading Works

- **Editing `.java` files**:
  - The volume mount (`.:/workspace`) binds your local files into the container.
  - When you edit any `.java` file, the container's background file watcher automatically triggers incremental recompilation (`mvn compile -q`).
  - Spring Boot DevTools immediately detects the updated `.class` files in `target/classes` and restarts the application context within 1-2 seconds.
- **Editing `src/main/resources` (e.g., `application.yaml`, Flyway migrations)**:
  - DevTools picks up resource changes instantly without needing a full Java recompilation.

### 4. Remote Debugging (Port 5005)

The development container exposes port `5005` with JDWP enabled. You can attach your IDE debugger directly:
- **IntelliJ**: Add Run Configuration -> *Remote JVM Debug* -> Host: `localhost`, Port: `5005`.
- **VS Code**: Attach via `.vscode/launch.json` on port `5005`.

---

## 🛠️ Build & Run Commands

### Docker Compose Commands

```powershell
# Start database and development container
docker compose up -d

# View live container logs
docker compose logs -f development

# Run tests inside test container
docker compose run --rm test

# Stop all containers
docker compose down
```

### Production Build & Run

```powershell
# Build production Docker image
docker compose -f docker-compose.prod.yaml build production

# Run production container
docker compose -f docker-compose.prod.yaml up -d production
```

### Local Maven Commands (Optional)

```powershell
# Compile source files
.\mvnw.cmd compile

# Run tests
.\mvnw.cmd test

# Run application locally
.\mvnw.cmd spring-boot:run

# Package executable JAR
.\mvnw.cmd clean package -DskipTests
```
