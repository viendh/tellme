# ── Stage 1: Build ──────────────────────────────────────────────
FROM maven:3.9.6-amazoncorretto-8 AS builder

WORKDIR /build
COPY pom.xml .
# Download dependencies first (cache layer)
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM amazoncorretto:8-al2-jre

WORKDIR /app

# Create non-root user
RUN useradd -r -s /bin/false appuser

# Directories
RUN mkdir -p /app/uploads /app/logs && chown -R appuser:appuser /app

COPY --from=builder /build/target/tellme-backend-*.jar app.jar

USER appuser

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/auth/health 2>/dev/null || exit 1

ENTRYPOINT ["java", \
  "-Xms256m", "-Xmx512m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
