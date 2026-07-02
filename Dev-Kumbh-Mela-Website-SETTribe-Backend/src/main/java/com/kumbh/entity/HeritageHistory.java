package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "heritage_history")
public class HeritageHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(length = 500)
    private String videoUrl;

    private String heading;

    @Column(columnDefinition = "TEXT")
    private String paragraph1;

    @Column(columnDefinition = "TEXT")
    private String paragraph2;

    @Column(length = 500)
    private String backgroundImage;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    public HeritageHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getHeading() { return heading; }
    public void setHeading(String heading) { this.heading = heading; }

    public String getParagraph1() { return paragraph1; }
    public void setParagraph1(String paragraph1) { this.paragraph1 = paragraph1; }

    public String getParagraph2() { return paragraph2; }
    public void setParagraph2(String paragraph2) { this.paragraph2 = paragraph2; }

    public String getBackgroundImage() { return backgroundImage; }
    public void setBackgroundImage(String backgroundImage) { this.backgroundImage = backgroundImage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
