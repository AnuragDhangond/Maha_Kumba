// Added for user activity tracking
package com.kumbh.service;

import com.kumbh.dto.UserActivityDto;
import com.kumbh.entity.UserActivity;
import com.kumbh.pagination.UserActivityPagination;
import com.kumbh.repository.UserActivityRepository;
import com.kumbh.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserActivityService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityService.class);

    @Autowired
    private UserActivityRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserActivityPagination pagination;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void logActivity(String ipAddress, String pageVisited, Long duration) {
        log.debug("[Activity] Attempting to log activity: IP={}, Page={}, Duration={}s", ipAddress, pageVisited, duration);
        try {
            UserActivity activity = new UserActivity();
            activity.setIpAddress(ipAddress);
            activity.setPageVisited(pageVisited);
            activity.setDuration(duration);
            
            UserActivity saved = repository.save(activity);
            log.debug("[Activity] Successfully saved activity record in DB. ID={}", saved.getId());
        } catch (Exception e) {
            log.error("[Activity] FAILED to save activity record: {}", e.getMessage(), e);
        }
    }

    public Map<String, Object> getUserStats() {
        long totalUsers = repository.countDistinctIpAddresses();
        
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusDays(14);
        
        long newThisWeek = repository.countNewUsersSince(oneWeekAgo);
        long newLastWeek = repository.countNewUsersBetween(twoWeeksAgo, oneWeekAgo);
        
        double percentage = 0.0;
        if (newLastWeek > 0) {
            percentage = ((double)(newThisWeek - newLastWeek) / newLastWeek) * 100.0;
        } else if (newThisWeek > 0) {
            percentage = 100.0;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("newThisWeek", newThisWeek);
        stats.put("percentage", Math.round(percentage * 10.0) / 10.0);
        return stats;
    }

    public Map<String, Object> getTodayOverview() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        long activeUsers24h = repository.countDistinctIpAddressesSince(last24Hours);
        long newRegistrations24h = userRepository.countUsersCreatedSince(last24Hours);
        long totalVisitors = repository.countDistinctIpAddresses();
        long totalRegisteredUsers = userRepository.count();
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("activeUsers24h", activeUsers24h);
        overview.put("newRegistrations24h", newRegistrations24h);
        overview.put("totalVisitors", totalVisitors);
        overview.put("totalRegisteredUsers", totalRegisteredUsers);
        overview.put("systemStatus", "Healthy");
        
        return overview;
    }

    public org.springframework.data.domain.Page<UserActivity> getActivities(int page, int size, String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        if (search != null && !search.trim().isEmpty()) {
            return repository.searchActivities(search, pageable);
        }
        return repository.findAll(pageable);
    }

    public org.springframework.data.domain.Page<UserActivityDto> getPaginatedActivities(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedActivities(search, page, size, sortBy, direction);
    }

    @Scheduled(fixedRate = 10000)
    public void broadcastActivityStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("overview", getTodayOverview());
            stats.put("stats", getUserStats());
            messagingTemplate.convertAndSend("/topic/viewers", stats);
        } catch (Exception e) {
            log.warn("[Activity] Failed to broadcast activity stats: {}", e.getMessage());
        }
    }
}
