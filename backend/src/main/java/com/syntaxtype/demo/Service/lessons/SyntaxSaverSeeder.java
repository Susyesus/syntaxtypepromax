package com.syntaxtype.demo.Service.lessons;

import com.syntaxtype.demo.Entity.Lessons.SyntaxSaverQuiz;
import com.syntaxtype.demo.Entity.Lessons.SyntaxSaverClasses.SyntaxSaverStep;
import com.syntaxtype.demo.Entity.Lessons.SyntaxSaverClasses.SyntaxSaverStepType;
import com.syntaxtype.demo.Repository.lessons.SyntaxSaverQuizRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Seeds the default "Syntax Saver Challenge" quiz on first startup if no quiz
 * with that title exists. Mirrors the previously hardcoded QuizData.js content
 * so existing students see no behavior change after the OI-04 migration.
 */
@Component
public class SyntaxSaverSeeder implements CommandLineRunner {

    private static final String DEFAULT_TITLE = "Syntax Saver Challenge";

    private final SyntaxSaverQuizRepository repository;

    public SyntaxSaverSeeder(SyntaxSaverQuizRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.existsByTitle(DEFAULT_TITLE)) return;

        SyntaxSaverQuiz quiz = new SyntaxSaverQuiz();
        quiz.setTitle(DEFAULT_TITLE);
        quiz.setDescription("Drag-and-drop keyword matching and code-reorder drills for C syntax.");

        quiz.setSteps(Arrays.asList(
                match(0, "Which keyword is used to return a value from a function in C?",
                        Arrays.asList("break", "return", "exit", "yield"), "return"),
                reorder(1, "Reorder the code blocks to create a valid C function:",
                        Arrays.asList(
                                "int",
                                "greet (",
                                "char name[] )",
                                "{",
                                "printf(\"Hello %s\", name);",
                                "return 0;",
                                "}"
                        )),
                match(2, "Which keyword is used to define a constant variable in C?",
                        Arrays.asList("static", "const", "define", "volatile"), "const"),
                reorder(3, "Reorder the code blocks to create a valid C main function:",
                        Arrays.asList(
                                "#include <stdio.h>",
                                "int main()",
                                "{",
                                "printf(\"Hello World\");",
                                "return 0;",
                                "}"
                        )),
                match(4, "Which function is used to print output in C?",
                        Arrays.asList("scanf()", "print()", "printf()", "output()"), "printf()")
        ));

        repository.save(quiz);
    }

    private static SyntaxSaverStep match(int order, String question, List<String> options, String correct) {
        SyntaxSaverStep step = new SyntaxSaverStep();
        step.setStepOrder(order);
        step.setType(SyntaxSaverStepType.MATCH);
        step.setQuestion(question);
        step.setOptions(options);
        step.setCorrectAnswer(correct);
        return step;
    }

    private static SyntaxSaverStep reorder(int order, String question, List<String> parts) {
        SyntaxSaverStep step = new SyntaxSaverStep();
        step.setStepOrder(order);
        step.setType(SyntaxSaverStepType.REORDER);
        step.setQuestion(question);
        step.setParts(parts);
        return step;
    }
}
