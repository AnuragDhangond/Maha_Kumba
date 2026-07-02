package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.time.LocalDateTime;

@Component
@Order(6)
public class EmergencySeeder {

    @Autowired
    private EmergencyAlertRepository alertRepository;
    @Autowired
    private HospitalRepository hospitalRepository;
    @Autowired
    private HelplineRepository helplineRepository;
    @Autowired
    private HealthTipRepository healthTipRepository;

    public void seed() {
        boolean isSeeding = alertRepository.count() == 0;
        if (alertRepository.count() == 0) {
            alertRepository.save(new EmergencyAlert(null, "ALT-001", 19.9975, 73.7898, "Medical", "Pending", "Critical", null, null));
            alertRepository.save(new EmergencyAlert(null, "ALT-002", 20.0050, 73.7950, "Fire", "Accepted", "High", "Operator1", null));
            alertRepository.save(new EmergencyAlert(null, "ALT-003", 19.9900, 73.7800, "Lost & Found", "Resolved", "Medium", "Operator2", LocalDateTime.now()));
            alertRepository.save(new EmergencyAlert(null, "ALT-004", 20.0100, 73.8000, "Crowd Control", "Pending", "High", null, null));
            alertRepository.save(new EmergencyAlert(null, "ALT-005", 19.9920, 73.7850, "Traffic", "Pending", "Medium", null, null));
        }

        if (hospitalRepository.count() == 0) {
            hospitalRepository.save(new Hospital(null, "Civil Hospital Nashik", "Panchavati, Nashik", 20.0050, 73.7950, "0253-1234567", 500, "Active"));
            hospitalRepository.save(new Hospital(null, "SMBT Hospital", "Trimbakeshwar Road", 19.9500, 73.7000, "0253-2223334", 200, "Active"));
            hospitalRepository.save(new Hospital(null, "Sahyadri Specialty", "Nashik City", 19.9975, 73.7898, "0253-9998887", 150, "Active"));
            hospitalRepository.save(new Hospital(null, "Apollo Clinic", "M.G. Road", 20.0000, 73.7800, "0253-1112223", 50, "Active"));
            hospitalRepository.save(new Hospital(null, "Wockhardt Hospital", "Mumbai Naka", 19.9880, 73.7750, "0253-5556667", 250, "Active"));
        }

        if (helplineRepository.count() == 0) {
            helplineRepository.save(new Helpline(null, "Police Emergency", "100", "ACTIVE"));
            helplineRepository.save(new Helpline(null, "Ambulance", "102", "ACTIVE"));
            helplineRepository.save(new Helpline(null, "Fire Brigade", "101", "ACTIVE"));
            helplineRepository.save(new Helpline(null, "Kumbh Control Room", "1800-123-4567", "ACTIVE"));
            helplineRepository.save(new Helpline(null, "Women's Helpline", "1091", "ACTIVE"));
        }

        if (healthTipRepository.count() == 0) {
            healthTipRepository.save(new HealthTip(null, "Hydration", "Drink at least 3-4 liters of water daily during the Mela.", "/src/assets/ganga_jal.png"));
            healthTipRepository.save(new HealthTip(null, "Hygiene", "Wash hands regularly and use sanitizers before meals.", "/src/assets/health_tips.png"));
            healthTipRepository.save(new HealthTip(null, "Heat Stroke", "Avoid direct sun exposure between 12 PM to 4 PM.", "/src/assets/safety_advisories.png"));
            healthTipRepository.save(new HealthTip(null, "First Aid", "Keep a basic medical kit with bandages and antiseptics.", "/src/assets/medical_center.png"));
            healthTipRepository.save(new HealthTip(null, "Lost Kids", "Write emergency contact number on child's forearm or keep a slip in their pocket.", "/src/assets/lost_found_kumbh.png"));
        }

        if (isSeeding) System.out.println("Emergency data seeded successfully!");
    }
}
