package com.kumbh.service.impl;

import com.kumbh.entity.HomepageConfig;
import com.kumbh.repository.HomepageConfigRepository;
import com.kumbh.service.HomepageConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomepageConfigServiceImpl implements HomepageConfigService {

    @Autowired
    private HomepageConfigRepository repository;

    @Override
    public HomepageConfig getConfig() {
        List<HomepageConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            return createDefaultConfig();
        }
        return configs.get(0);
    }

    @Override
    public HomepageConfig updateConfig(HomepageConfig configDetails) {
        HomepageConfig existing = getConfig();
        if (existing.getId() == null) {
            existing = new HomepageConfig();
        }
        
        if (configDetails.getShahiSnanHeading() != null) {
            existing.setShahiSnanHeading(configDetails.getShahiSnanHeading());
        }
        if (configDetails.getShahiSnanStartDate() != null) {
            existing.setShahiSnanStartDate(configDetails.getShahiSnanStartDate());
        }
        if (configDetails.getShahiSnanEndDate() != null) {
            existing.setShahiSnanEndDate(configDetails.getShahiSnanEndDate());
        }
        
        return repository.save(existing);
    }

    private HomepageConfig createDefaultConfig() {
        HomepageConfig config = new HomepageConfig();
        config.setShahiSnanHeading("OFFICIAL DATES FOR THE SHAHI SNAN");
        config.setShahiSnanStartDate("18th March 2027");
        config.setShahiSnanEndDate("20th March 2027");
        return repository.save(config);
    }
}
