package com.syntaxtype.demo.Entity.Lessons;

import com.syntaxtype.demo.Entity.Lessons.SyntaxSaverClasses.SyntaxSaverStep;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

import java.util.ArrayList;
import java.util.List;

/**
 * SyntaxSaverQuiz (SDD OI-04 remediation).
 * Backs the Syntax Sniper module — previously hardcoded in QuizData.js.
 * A quiz is an ordered list of steps (MATCH / REORDER / BATTLE).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "syntax_saver_quiz")
public class SyntaxSaverQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 600)
    private String description;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "quiz_id", nullable = false)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<SyntaxSaverStep> steps = new ArrayList<>();
}
