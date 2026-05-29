package com.syntaxtype.demo.features.lesson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.syntaxtype.demo.features.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int score;
    private int timeInSeconds;

    private String challengeType;
    private double wpm;

    // Measurement fields (added for objective tracking).
    // accuracy: 0-100 percentage for this session.
    // modeType: PRE_TEST / PRACTICE / POST_TEST (null for non-assessment plays)
    //   — lets faculty compute pre-test → post-test improvement per game.
    // correctCount/totalCount/errorCount: per-objective tallies, e.g. prompts
    //   answered correctly (Translation Terminal), blanks filled (Syntax Sniper),
    //   bugs fixed vs seen (Bug Smasher). Enables error-detection / recall /
    //   punctuation accuracy reporting beyond the raw game score.
    // columnDefinition gives a DB default so ddl-auto=update can ADD these
    // columns to the existing (non-empty) scores table without failing on the
    // NOT NULL constraint — existing rows backfill to 0.
    @Column(columnDefinition = "integer default 0 not null")
    private int accuracy;
    private String modeType;
    @Column(columnDefinition = "integer default 0 not null")
    private int correctCount;
    @Column(columnDefinition = "integer default 0 not null")
    private int totalCount;
    @Column(columnDefinition = "integer default 0 not null")
    private int errorCount;

    private LocalDateTime submittedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // No-args constructor
    public Score() {
    }

    // All-args constructor (excluding id because it's auto-generated)
    public Score(int score, int timeInSeconds, String challengeType, double wpm, LocalDateTime submittedAt) {
        this.score = score;
        this.timeInSeconds = timeInSeconds;
        this.challengeType = challengeType;
        this.wpm = wpm;
        this.submittedAt = submittedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTimeInSeconds() {
        return timeInSeconds;
    }

    public void setTimeInSeconds(int timeInSeconds) {
        this.timeInSeconds = timeInSeconds;
    }

    public String getChallengeType() {
        return challengeType;
    }

    public void setChallengeType(String challengeType) {
        this.challengeType = challengeType;
    }

    public double getWpm() {
        return wpm;
    }

    public void setWpm(double wpm) {
        this.wpm = wpm;
    }

    public int getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(int accuracy) {
        this.accuracy = accuracy;
    }

    public String getModeType() {
        return modeType;
    }

    public void setModeType(String modeType) {
        this.modeType = modeType;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // toString (excluding submittedAt)
    @Override
    public String toString() {
        return "Score{" +
                "id=" + id +
                ", score=" + score +
                ", timeInSeconds=" + timeInSeconds +
                ", challengeType='" + challengeType + '\'' +
                ", wpm=" + wpm +
                '}';
    }
}
