// Added for user activity tracking
package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_activity")
public class UserActivity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ipAddress;
    private String pageVisited;
    private Long duration;

    public UserActivity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    
    public String getPageVisited() { return pageVisited; }
    public void setPageVisited(String pageVisited) { this.pageVisited = pageVisited; }

    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
}
