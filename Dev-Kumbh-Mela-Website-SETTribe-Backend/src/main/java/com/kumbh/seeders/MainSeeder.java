package com.kumbh.seeders;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class MainSeeder implements CommandLineRunner {

    @Autowired private UserSeeder userSeeder;
    @Autowired private ShopSeeder shopSeeder;
    @Autowired private HeritageSeeder heritageSeeder;
    @Autowired private ActivitySeeder activitySeeder;
    @Autowired private AccommodationSeeder accommodationSeeder;
    @Autowired private EmergencySeeder emergencySeeder;
    @Autowired private InfoSeeder infoSeeder;
    @Autowired private AnalyticsSeeder analyticsSeeder;
    @Autowired private BookingSeeder bookingSeeder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting database seeding...");
        
        userSeeder.seed();
        shopSeeder.seed();
        heritageSeeder.seed();
        activitySeeder.seed();
        accommodationSeeder.seed();
        emergencySeeder.seed();
        infoSeeder.seed();
        analyticsSeeder.seed();
        bookingSeeder.seed();

        System.out.println("Database seeding process finished!");
    }
}
