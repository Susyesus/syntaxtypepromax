package com.syntaxtype.demo.features.statistics.entity;

import java.time.LocalDateTime;

import com.syntaxtype.demo.features.user.entity.Student;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "student_achievements")
@Builder
public class StudentAchievements {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentAchievementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id")
    private Achievements achievementId;

    private LocalDateTime awardedAt;
}