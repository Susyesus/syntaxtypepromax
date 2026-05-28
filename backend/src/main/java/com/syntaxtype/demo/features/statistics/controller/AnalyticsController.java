package com.syntaxtype.demo.features.statistics.controller;

import com.syntaxtype.demo.features.statistics.entity.UserStatistics;
import com.syntaxtype.demo.features.statistics.repository.UserStatisticsRepository;
import com.syntaxtype.demo.features.user.entity.Student;
import com.syntaxtype.demo.features.user.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final StudentRepository studentRepository;
    private final UserStatisticsRepository userStatisticsRepository;

    /**
     * GET /api/analytics/students.csv
     * Returns a UTF-8 CSV of every student's profile + lifetime statistics.
     * Restricted to ADMIN and TEACHER roles.
     */
    @GetMapping("/students.csv")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<byte[]> exportStudentsCsv() {
        List<Student> students = studentRepository.findAll();

        Map<Long, UserStatistics> statsById = userStatisticsRepository.findAll().stream()
                .filter(us -> us.getUser() != null)
                .collect(Collectors.toMap(
                        us -> us.getUser().getUserId(),
                        us -> us,
                        (a, b) -> a));

        StringBuilder csv = new StringBuilder();
        csv.append("Name,Username,University Email,Course,Year Level,Class,Section,"
                + "Best WPM,Accuracy (%),Tests Taken,Total Errors,Total Time (sec),Lifetime XP\n");

        for (Student s : students) {
            Long uid = s.getUser() != null ? s.getUser().getUserId() : null;
            UserStatistics us = uid != null ? statsById.get(uid) : null;

            csv.append(csv(s.getFirstName() + " " + s.getLastName())).append(',');
            csv.append(csv(s.getUser() != null ? s.getUser().getUsername() : "")).append(',');
            csv.append(csv(s.getUniversityEmail())).append(',');
            csv.append(csv(s.getCourse())).append(',');
            csv.append(csv(s.getYearLevel())).append(',');
            csv.append(csv(s.getClassName())).append(',');
            csv.append(csv(s.getSection())).append(',');
            csv.append(us != null && us.getWordsPerMinute()  != null ? us.getWordsPerMinute()  : 0).append(',');
            csv.append(us != null && us.getAccuracy()        != null ? us.getAccuracy()        : 0).append(',');
            csv.append(us != null && us.getTotalTestsTaken() != null ? us.getTotalTestsTaken() : 0).append(',');
            csv.append(us != null && us.getTotalErrors()     != null ? us.getTotalErrors()     : 0).append(',');
            csv.append(us != null && us.getTotalTimeSpent()  != null ? us.getTotalTimeSpent()  : 0).append(',');
            csv.append(us != null && us.getLifetimeXp()      != null ? us.getLifetimeXp()      : 0).append('\n');
        }

        byte[] body = csv.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_analytics.csv\"");
        headers.setContentLength(body.length);

        return ResponseEntity.ok().headers(headers).body(body);
    }

    /** Wraps a value in double-quotes if it contains a comma, quote, or newline. */
    private String csv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
