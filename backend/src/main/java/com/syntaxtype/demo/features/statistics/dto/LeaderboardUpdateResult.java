package com.syntaxtype.demo.features.statistics.dto;

import lombok.*;

import java.util.List;

/**
 * Result of a leaderboard update operation.
 * Returned by POST /api/scores/{category} endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardUpdateResult {
    private Boolean success;
    private Boolean isNewBest;
    private Integer rank;
    /** Names of achievement badges newly awarded during this session (may be empty). */
    @Builder.Default
    private List<String> awardedBadges = new java.util.ArrayList<>();
}