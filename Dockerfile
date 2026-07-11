FROM gradle:8.8-jdk17 AS build

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/backend/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java","-jar","app.jar","--server.port=8080"]