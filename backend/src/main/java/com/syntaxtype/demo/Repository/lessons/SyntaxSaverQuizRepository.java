package com.syntaxtype.demo.Repository.lessons;

import com.syntaxtype.demo.Entity.Lessons.SyntaxSaverQuiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyntaxSaverQuizRepository extends JpaRepository<SyntaxSaverQuiz, Long> {
    boolean existsByTitle(String title);
}
