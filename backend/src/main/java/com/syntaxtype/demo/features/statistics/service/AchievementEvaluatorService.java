package com.syntaxtype.demo.features.statistics.service;

import com.syntaxtype.demo.core.enums.Role;
import com.syntaxtype.demo.features.statistics.entity.Achievements;
import com.syntaxtype.demo.features.statistics.entity.StudentAchievements;
import com.syntaxtype.demo.features.statistics.entity.UserStatistics;
import com.syntaxtype.demo.features.statistics.repository.AchievementsRepository;
import com.syntaxtype.demo.features.statistics.repository.StudentAchievementsRepository;
import com.syntaxtype.demo.features.statistics.repository.UserStatisticsRepository;
import com.syntaxtype.demo.features.user.entity.Student;
import com.syntaxtype.demo.features.user.entity.User;
import com.syntaxtype.demo.features.user.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementEvaluatorService {

    private static final Logger log = LoggerFactory.getLogger(AchievementEvaluatorService.class);

    private final AchievementsRepository achievementsRepository;
    private final StudentAchievementsRepository studentAchievementsRepository;
    private final UserStatisticsRepository userStatisticsRepository;
    private final StudentRepository studentRepository;

    /**
     * Evaluates all teacher-authored achievements for a student after a session ends.
     * Supported triggerType values (case-insensitive):
     *   WPM              – session WPM >= triggerValue
     *   ACCURACY         – session accuracy >= triggerValue
     *   SCORE            – session rawScore >= triggerValue
     *   COMPLETION_COUNT – lifetime totalTestsTaken >= triggerValue
     *   LIFETIME_XP      – lifetime XP >= triggerValue
     *
     * @return names of badges newly awarded this session (may be empty)
     */
    public List<String> evaluateAndAward(User user, int sessionWpm, int sessionAccuracy, int sessionScore) {
        List<String> newBadges = new ArrayList<>();
        if (user == null || user.getUserRole() != Role.STUDENT) return newBadges;

        try {
            Optional<Student> studentOpt = studentRepository.findByUser(user);
            if (studentOpt.isEmpty()) return newBadges;
            Student student = studentOpt.get();

            // Collect already-earned achievement IDs so we never double-award.
            Set<Long> earnedIds = studentAchievementsRepository.findByStudent(student).stream()
                    .filter(sa -> sa.getAchievementId() != null)
                    .map(sa -> sa.getAchievementId().getAchievementId())
                    .collect(Collectors.toSet());

            // Lifetime stats for count-based triggers (XP was already incremented before this call).
            Optional<UserStatistics> statsOpt = userStatisticsRepository.findByUser(user);
            int totalTests  = statsOpt.map(s -> s.getTotalTestsTaken() != null ? s.getTotalTestsTaken() : 0).orElse(0);
            long lifetimeXp = statsOpt.map(s -> s.getLifetimeXp()       != null ? s.getLifetimeXp()       : 0L).orElse(0L);

            for (Achievements achievement : achievementsRepository.findAll()) {
                if (earnedIds.contains(achievement.getAchievementId())) continue;
                if (achievement.getTriggerType() == null || achievement.getTriggerValue() == null) continue;

                boolean triggered = switch (achievement.getTriggerType().toUpperCase()) {
                    case "WPM"              -> sessionWpm      >= achievement.getTriggerValue();
                    case "ACCURACY"         -> sessionAccuracy >= achievement.getTriggerValue();
                    case "SCORE"            -> sessionScore    >= achievement.getTriggerValue();
                    case "COMPLETION_COUNT" -> totalTests      >= achievement.getTriggerValue();
                    case "LIFETIME_XP"      -> lifetimeXp      >= achievement.getTriggerValue();
                    default -> false;
                };

                if (triggered) {
                    StudentAchievements award = new StudentAchievements();
                    award.setStudent(student);
                    award.setAchievementId(achievement);
                    award.setAwardedAt(LocalDateTime.now());
                    studentAchievementsRepository.save(award);
                    newBadges.add(achievement.getName());
                }
            }
        } catch (Exception e) {
            log.warn("Achievement evaluation failed for user {}: {}", user.getUsername(), e.getMessage());
        }

        return newBadges;
    }
}
