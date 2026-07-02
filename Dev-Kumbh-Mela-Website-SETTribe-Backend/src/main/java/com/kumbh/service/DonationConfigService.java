package com.kumbh.service;

import com.kumbh.entity.DonationConfig;

public interface DonationConfigService {
    DonationConfig getConfig();
    DonationConfig updateConfig(DonationConfig config);
}
