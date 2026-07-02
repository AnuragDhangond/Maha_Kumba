package com.kumbh;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@EnableAsync
public class KumbhBackendApplication {

    public static void main(String[] args) {
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            System.err.println("FATAL UNCAUGHT EXCEPTION: " + e.getMessage());
            e.printStackTrace(System.err);
            System.err.flush();
        });

        try {
            // Load .env variables into System properties for Spring to resolve placeholders
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

            System.out.println("DEBUG STARTUP: System.getenv(\"DB_URL\"): " + System.getenv("DB_URL"));
            System.out.println("DEBUG STARTUP: System.getenv(\"DB_USERNAME\"): " + System.getenv("DB_USERNAME"));
            System.out.println("DEBUG STARTUP: System.getenv(\"SPRING_PROFILES_ACTIVE\"): " + System.getenv("SPRING_PROFILES_ACTIVE"));

            // Check if DATABASE_URL is set (from Render or standard environments)
            String databaseUrl = System.getenv("DATABASE_URL");
            if (databaseUrl == null) {
                databaseUrl = System.getProperty("DATABASE_URL");
            }
            if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
                try {
                    // Format: postgres://username:password@host:port/database
                    java.net.URI uri = new java.net.URI(databaseUrl);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] credentials = userInfo.split(":", 2);
                        String username = credentials[0];
                        String password = credentials[1];
                        int port = uri.getPort();
                        String portStr = (port == -1) ? "" : ":" + port;
                        String query = uri.getQuery();
                        String dbUrl = "jdbc:postgresql://" + uri.getHost() + portStr + uri.getPath();
                        if (query != null && !query.isEmpty()) {
                            dbUrl += "?" + query;
                        } else {
                            dbUrl += "?sslmode=require";
                        }

                        System.setProperty("DB_URL", dbUrl);
                        System.setProperty("DB_USER", username);
                        System.setProperty("DB_PASSWORD", password);
                        System.setProperty("DB_DRIVER", "org.postgresql.Driver");
                        System.setProperty("DB_DIALECT", "org.hibernate.dialect.PostgreSQLDialect");
                        System.out.println("Auto-configured PostgreSQL from DATABASE_URL: " + dbUrl);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to parse DATABASE_URL: " + e.getMessage());
                }
            }

            SpringApplication.run(KumbhBackendApplication.class, args);
        } catch (Throwable t) {
            System.err.println("FATAL STARTUP EXCEPTION: " + t.getMessage());
            t.printStackTrace(System.err);
            System.err.flush();
            System.exit(1);
        }
    }
}