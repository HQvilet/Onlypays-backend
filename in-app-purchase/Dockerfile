# ---- Stage 1: Development (Hot reloading, source bind-mounted, debug enabled) ----
FROM maven:3.9.9-eclipse-temurin-21 AS development

# Install inotify-tools for in-container file watcher & recompile, dos2unix for line-endings
RUN apt-get update -qq && \
    apt-get install -y -qq inotify-tools dos2unix && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy build descriptor and dev entrypoint script
COPY pom.xml ./
COPY .mvn ./.mvn
COPY mvnw ./
COPY dev-entrypoint.sh ./dev-entrypoint.sh
RUN dos2unix dev-entrypoint.sh && chmod +x dev-entrypoint.sh

# Ports:
# 8081: Spring Boot Application HTTP port
# 5005: JDWP Remote Debugging port
# 35729: DevTools LiveReload port
EXPOSE 8081 5005 35729

ENTRYPOINT ["./dev-entrypoint.sh"]


# ---- Stage 2: Test (Runs unit and integration tests) ----
FROM development AS test

CMD ["mvn", "test"]


# ---- Stage 3: Build (Compiles and packages production JAR) ----
FROM development AS build

COPY src ./src
RUN mvn clean package -DskipTests -q


# ---- Stage 4: Production (Minimal JRE image with packaged JAR) ----
FROM eclipse-temurin:21-jre AS production

WORKDIR /app

# Copy packaged JAR from build stage
COPY --from=build /workspace/target/in-app-purchase-*.jar /app/app.jar

ENV PORT=8081
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
