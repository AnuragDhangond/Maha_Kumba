package com.kumbh.entity;

public enum StayCategory {
    PREMIUM_HOTELS("Premium Hotels"),
    TRADITIONAL_ASHRAMS("Traditional Ashrams"),
    LUXURY_TENTS("Luxury Tents"),
    HERITAGE_HOMESTAYS("Heritage Homestays");

    private final String displayName;

    StayCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static StayCategory fromDisplayName(String displayName) {
        for (StayCategory category : StayCategory.values()) {
            if (category.displayName.equalsIgnoreCase(displayName) || category.name().equalsIgnoreCase(displayName)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown category: " + displayName);
    }
}
