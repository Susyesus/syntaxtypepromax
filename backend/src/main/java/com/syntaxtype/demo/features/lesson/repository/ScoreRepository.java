package com.syntaxtype.demo.features.lesson.repository;

import com.syntaxtype.demo.features.lesson.entity.Score;
import com.syntaxtype.demo.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByChallengeTypeOrderBySubmittedAtDesc(String challengeType);
    List<Score> findByUserOrderBySubmittedAtDesc(User user);
}
