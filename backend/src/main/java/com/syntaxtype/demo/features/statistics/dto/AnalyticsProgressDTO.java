package com.syntaxtype.demo.features.statistics.dto;

import lombok.*;

import java.util.List;

/**
 * Per-game pre-test → post-test progress summary for faculty.
 * One instance per game (challengeType). `rows` holds one entry per student
 * who has at least one assessment attempt for that game; the cohort averages
 * are computed over students who completed BOTH a pre-test and a post-test,
 * which is the population the research objectives are measured against.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsProgressDTO {
    private String game;   // challengeType, e.g. SYNTAX_SAVER
    private String label;  // human label, e.g. "Syntax Sniper"

    private int studentsAssessed;       // students with both pre and post
    private double avgPrePercent;       // mean best pre-test accuracy
    private double avgPostPercent;      // mean best post-test accuracy
    private double avgImprovementPercent; // mean (post - pre) accuracy, percentage points
    private double avgPreScore;
    private double avgPostScore;

    private List<StudentRow> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRow {
        private String name;
        private String username;
        private String section;

        private Integer preScore;
        private Integer postScore;
        private Integer prePercent;   // best pre-test accuracy (0-100), null if no pre
        private Integer postPercent;  // best post-test accuracy (0-100), null if no post
        private Integer improvementPercent; // postPercent - prePercent (pp), null if either missing

        private int preAttempts;
        private int postAttempts;
    }
}
