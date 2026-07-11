# ---------- Build ----------
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app/backend

COPY backend/ .

RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

# ---------- Runtime ----------
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /app/backend/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]