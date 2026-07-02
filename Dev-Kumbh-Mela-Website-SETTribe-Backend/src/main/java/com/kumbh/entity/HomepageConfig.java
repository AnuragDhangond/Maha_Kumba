package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "homepage_configs")
public class HomepageConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shahiSnanHeading;
    private String shahiSnanStartDate;
    private String shahiSnanEndDate;

    public HomepageConfig() {
    }

    public HomepageConfig(String shahiSnanHeading, String shahiSnanStartDate, String shahiSnanEndDate) {
        this.shahiSnanHeading = shahiSnanHeading;
        this.shahiSnanStartDate = shahiSnanStartDate;
        this.shahiSnanEndDate = shahiSnanEndDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShahiSnanHeading() {
        return shahiSnanHeading;
    }

    public void setShahiSnanHeading(String shahiSnanHeading) {
        this.shahiSnanHeading = shahiSnanHeading;
    }

    public String getShahiSnanStartDate() {
        return shahiSnanStartDate;
    }

    public void setShahiSnanStartDate(String shahiSnanStartDate) {
        this.shahiSnanStartDate = shahiSnanStartDate;
    }

    public String getShahiSnanEndDate() {
        return shahiSnanEndDate;
    }

    public void setShahiSnanEndDate(String shahiSnanEndDate) {
        this.shahiSnanEndDate = shahiSnanEndDate;
    }
}
