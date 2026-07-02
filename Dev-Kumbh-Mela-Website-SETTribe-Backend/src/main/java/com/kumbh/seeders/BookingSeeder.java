package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.util.List;

@Component
@Order(9)
public class BookingSeeder {

    @Autowired
    private PoojaBookingRepository poojaBookingRepository;
    @Autowired
    private DonationConfigRepository donationConfigRepository;
    @Autowired
    private DonationTransactionRepository donationTransactionRepository;
    @Autowired
    private AcharyaRepository acharyaRepository;
    @Autowired
    private PoojaItemRepository poojaItemRepository;

    public void seed() {
        boolean isSeeding = donationConfigRepository.count() == 0;
        if (donationConfigRepository.count() == 0) {
            DonationConfig c = new DonationConfig();
            c.setHeroTitle("Support the Divine Assembly");
            c.setHeroSubtitle("Your contribution helps preserve ancient traditions.");
            c.setPlannerTitle("Anndaan Planner");
            c.setPlannerDescription("Plan your food donation for the pilgrims.");
            c.setDonationSectionTitle("Sacred Offerings");
            c.setPresetAmounts("501,1101,2101,5001");
            c.setGiftEligibilityAmount(5000);
            c.setGiftTitle("Prasad Box");
            c.setGiftDescription("Get a special blessed prasad box for donations above 5000.");
            c.setUpiId("kumbh@upi");
            c.setUpiName("Kumbh Mela Authority");
            c.setPaymentMethods("UPI,Credit Card,Net Banking");
            donationConfigRepository.save(c);
        }

        if (donationTransactionRepository.count() == 0) {
            donationTransactionRepository.save(createDonation("Amit Sharma", "amit@example.com", 1101.0, "TXN-001"));
            donationTransactionRepository.save(createDonation("Sonal Verma", "sonal@example.com", 5001.0, "TXN-002"));
            donationTransactionRepository.save(createDonation("Vijay Khanna", "vijay@example.com", 501.0, "TXN-003"));
            donationTransactionRepository.save(createDonation("Neha Gupta", "neha@example.com", 2101.0, "TXN-004"));
            donationTransactionRepository.save(createDonation("Ravi Shastri", "ravi@example.com", 11000.0, "TXN-005"));
        }

        if (poojaBookingRepository.count() == 0) {
            List<Acharya> acharyas = acharyaRepository.findAll();
            List<PoojaItem> poojas = poojaItemRepository.findAll();
            
            if (acharyas.size() >= 5 && poojas.size() >= 5) {
                poojaBookingRepository.save(createBooking(acharyas.get(0), poojas.get(0), "Rahul Dravid", "Vashishta"));
                poojaBookingRepository.save(createBooking(acharyas.get(1), poojas.get(1), "Priya Rai", "Kashyap"));
                poojaBookingRepository.save(createBooking(acharyas.get(2), poojas.get(2), "Karan Johar", "Bhardwaj"));
                poojaBookingRepository.save(createBooking(acharyas.get(3), poojas.get(3), "Simran Kaur", "Atri"));
                poojaBookingRepository.save(createBooking(acharyas.get(4), poojas.get(4), "Suresh Rana", "Garg"));
            }
        }

        if (isSeeding) System.out.println("Booking data seeded successfully!");
    }

    private DonationTransaction createDonation(String name, String email, double amount, String ref) {
        DonationTransaction t = new DonationTransaction();
        t.setDonorName(name);
        t.setDonorEmail(email);
        t.setAmount(amount);
        t.setTransactionReference(ref);
        t.setStatus("SUCCESS");
        return t;
    }

    private PoojaBooking createBooking(Acharya a, PoojaItem p, String devotee, String gotra) {
        PoojaBooking b = new PoojaBooking();
        b.setAcharyaId(a.getId());
        b.setPoojaId(p.getId());
        b.setAcharyaName(a.getName());
        b.setPoojaName(p.getName());
        b.setPoojaDuration(p.getDuration());
        b.setPrice(p.getPrice());
        b.setDevoteeName(devotee);
        b.setGotra(gotra);
        b.setSankalpa("For family prosperity and health.");
        b.setFamilyCount(4);
        b.setLocation("Nashik");
        b.setPreferredDate("2026-05-20");
        b.setPreferredSlot("Morning");
        b.setStatus("CONFIRMED");
        b.setMobileNumber("9876543210");
        return b;
    }
}
