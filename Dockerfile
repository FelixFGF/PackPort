FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

EXPOSE 8080

CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"]