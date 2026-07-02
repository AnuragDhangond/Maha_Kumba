package com.kumbh.dto;

public class CrowdStatsDto {
    private long totalLiveUsers;
    private long highDensityZones;
    private int avgPilgrimsPerSite;

    public CrowdStatsDto() {}

    public CrowdStatsDto(long totalLiveUsers, long highDensityZones, int avgPilgrimsPerSite) {
        this.totalLiveUsers = totalLiveUsers;
        this.highDensityZones = highDensityZones;
        this.avgPilgrimsPerSite = avgPilgrimsPerSite;
    }

    public long getTotalLiveUsers() {
        return totalLiveUsers;
    }

    public void setTotalLiveUsers(long totalLiveUsers) {
        this.totalLiveUsers = totalLiveUsers;
    }

    public long getHighDensityZones() {
        return highDensityZones;
    }

    public void setHighDensityZones(long highDensityZones) {
        this.highDensityZones = highDensityZones;
    }

    public int getAvgPilgrimsPerSite() {
        return avgPilgrimsPerSite;
    }

    public void setAvgPilgrimsPerSite(int avgPilgrimsPerSite) {
        this.avgPilgrimsPerSite = avgPilgrimsPerSite;
    }
}

