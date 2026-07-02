package com.kumbh.service.impl;

import com.kumbh.entity.DonationConfig;
import com.kumbh.repository.DonationConfigRepository;
import com.kumbh.service.DonationConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationConfigServiceImpl implements DonationConfigService {

    @Autowired
    private DonationConfigRepository repository;

    @Override
    public DonationConfig getConfig() {
        List<DonationConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            return createDefaultConfig();
        }
        return configs.get(0);
    }

    @Override
    public DonationConfig updateConfig(DonationConfig configDetails) {
        DonationConfig existing = getConfig();
        existing.setHeroTitle(configDetails.getHeroTitle());
        existing.setHeroSubtitle(configDetails.getHeroSubtitle());
        existing.setPlannerTitle(configDetails.getPlannerTitle());
        existing.setPlannerDescription(configDetails.getPlannerDescription());
        existing.setDonationSectionTitle(configDetails.getDonationSectionTitle());
        existing.setPresetAmounts(configDetails.getPresetAmounts());
        existing.setGiftEligibilityAmount(configDetails.getGiftEligibilityAmount());
        existing.setGiftTitle(configDetails.getGiftTitle());
        existing.setGiftDescription(configDetails.getGiftDescription());
        existing.setUpiId(configDetails.getUpiId());
        existing.setUpiName(configDetails.getUpiName());
        existing.setPaymentMethods(configDetails.getPaymentMethods());
        return repository.save(existing);
    }

    private DonationConfig createDefaultConfig() {
        DonationConfig config = new DonationConfig();
        config.setHeroTitle("Support The Sacred Journey");
        config.setHeroSubtitle("Plan your spiritual path and contribute to the divine cause of Maha Kumbh Mela 2027.");
        config.setPlannerTitle("AI-Based Budget Planner");
        config.setPlannerDescription("Discover the smartest way to manage your expenses during the Kumbh Mela. Our advanced AI analyzes real-time accommodation, travel, and food costs to create a personalized, optimized budget for your spiritual journey.");
        config.setDonationSectionTitle("Make a Sacred Donation");
        config.setPresetAmounts("101,501,1001,2100,5100");
        config.setGiftEligibilityAmount(1000);
        config.setGiftTitle("Divine Blessing Included!");
        config.setGiftDescription("You are eligible for an exclusive framed Lord Shiva image as a return gift.");
        config.setUpiId("kumbhmela2027@upi");
        config.setUpiName("Maha Kumbh Mela");
        config.setPaymentMethods("GPay,PhonePe,Paytm,BHIM");
        return repository.save(config);
    }
}
