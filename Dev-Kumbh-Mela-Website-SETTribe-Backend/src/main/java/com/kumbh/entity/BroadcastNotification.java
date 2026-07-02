package com.kumbh.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "broadcast_notifications")
@Data
@EqualsAndHashCode(callSuper = true)
public class BroadcastNotification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String type; // Manual, Weather, Safety
    
    @Column(name = "is_scrolling")
    private Boolean isScrolling = false;
    
    @Column(name = "is_popup")
    private Boolean isPopup = false;
}