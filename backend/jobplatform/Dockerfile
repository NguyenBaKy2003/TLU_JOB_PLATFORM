# 
#  Dockerfile — CareerUp Backend
#  Spring Boot | Java 21 | Eclipse Temurin
# 

# ── Stage 1: Builder ─
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Download dependencies trước (tận dụng Docker layer cache)
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B -q

# Build
COPY src ./src

RUN ./mvnw package -B -q \
    -DskipTests \
    -Dspring-boot.repackage.excludeDevtools=true

# ── Stage 2: Runtime ─
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# JAVA_OPTS không định nghĩa ở đây — được inject qua docker-compose environment
# để docker-compose.dev.yml là nguồn cấu hình duy nhất cho từng môi trường
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1