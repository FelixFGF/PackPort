FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN ./gradlew.bat bootJar

EXPOSE 8080

CMD ["java","-jar","build/libs/backend-0.0.1-SNAPSHOT.jar","--server.port=8080"]