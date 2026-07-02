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

            // Extract and clean raw environment variables
            String dbUrl = cleanEnvVar("DB_URL");
            String dbUser = cleanEnvVar("DB_USERNAME");
            if (dbUser == null) {
                dbUser = cleanEnvVar("DB_USER");
            }
            String dbPassword = cleanEnvVar("DB_PASSWORD");
            String activeProfiles = cleanEnvVar("SPRING_PROFILES_ACTIVE");

            // Direct Spring Boot configuration injection at JVM level
            if (dbUrl != null) {
                System.setProperty("spring.datasource.url", dbUrl);
                System.out.println("JVM INJECTION: spring.datasource.url = " + dbUrl);
            }
            if (dbUser != null) {
                System.setProperty("spring.datasource.username", dbUser);
                System.out.println("JVM INJECTION: spring.datasource.username = " + dbUser);
            }
            if (dbPassword != null) {
                System.setProperty("spring.datasource.password", dbPassword);
            }
            
            // Hardcode standard production values directly to guarantee resolution
            System.setProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");
            System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.MySQLDialect");

            if (activeProfiles != null) {
                System.setProperty("spring.profiles.active", activeProfiles);
                System.out.println("JVM INJECTION: spring.profiles.active = " + activeProfiles);
            }

            // Class loading diagnostic check
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                System.out.println("DEBUG CLASS LOADING: com.mysql.cj.jdbc.Driver is present and loadable!");
            } catch (ClassNotFoundException e) {
                System.err.println("DEBUG CLASS LOADING ERROR: com.mysql.cj.jdbc.Driver NOT found in classpath!");
            }

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
                        String dbUrlPg = "jdbc:postgresql://" + uri.getHost() + portStr + uri.getPath();
                        if (query != null && !query.isEmpty()) {
                            dbUrlPg += "?" + query;
                        } else {
                            dbUrlPg += "?sslmode=require";
                        }

                        System.setProperty("spring.datasource.url", dbUrlPg);
                        System.setProperty("spring.datasource.username", username);
                        System.setProperty("spring.datasource.password", password);
                        System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
                        System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
                        System.out.println("Auto-configured PostgreSQL from DATABASE_URL: " + dbUrlPg);
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

    private static String cleanEnvVar(String key) {
        String val = System.getenv(key);
        if (val != null) {
            val = val.replace("\n", "").replace("\r", "").trim();
        }
        return val;
    }
}