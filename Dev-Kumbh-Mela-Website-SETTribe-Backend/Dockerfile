# --- Stage 1: Build Stage ---
FROM eclipse-temurin:17-jdk-jammy as builder

# Set working directory
WORKDIR /app

# Copy the mvnw and pom files first to leverage Docker cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
# Dependency download (cacheable)
RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# --- Stage 2: Run Stage ---
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy ONLY the built jar from the builder stage and rename it to app.jar
COPY --from=builder /app/target/*.jar app.jar

# Expose the port (usually 8080 for Spring Boot)
EXPOSE 8080

# Run the explicitly named jar
ENTRYPOINT ["java", "-jar", "app.jar"]
