package com.kumbh.service;

import com.kumbh.entity.HomepageConfig;

public interface HomepageConfigService {
    HomepageConfig getConfig();
    HomepageConfig updateConfig(HomepageConfig config);
}
