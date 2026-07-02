package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "helplines")
public class Helpline extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String number;

    @Column(nullable = false)
    private String status = "ACTIVE"; // 'ACTIVE', 'INACTIVE'

    public Helpline() {
    }

    public Helpline(Long id, String name, String number, String status) {
        this.id = id;
        this.name = name;
        this.number = number;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
