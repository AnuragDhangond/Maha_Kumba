package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "translations")
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "translation_key", unique = true, nullable = false)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String en;

    @Column(columnDefinition = "TEXT")
    private String hi;

    @Column(columnDefinition = "TEXT")
    private String mr;

    @Column(columnDefinition = "TEXT")
    private String sa;

    public Translation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getEn() { return en; }
    public void setEn(String en) { this.en = en; }

    public String getHi() { return hi; }
    public void setHi(String hi) { this.hi = hi; }

    public String getMr() { return mr; }
    public void setMr(String mr) { this.mr = mr; }

    public String getSa() { return sa; }
    public void setSa(String sa) { this.sa = sa; }
}
