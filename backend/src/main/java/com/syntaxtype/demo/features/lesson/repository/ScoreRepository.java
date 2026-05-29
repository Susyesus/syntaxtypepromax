package com.syntaxtype.demo.features.lesson.repository;

import com.syntaxtype.demo.features.lesson.entity.Score;
import com.syntaxtype.demo.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByChallengeTypeOrderBySubmittedAtDesc(String challengeType);
    List<Score> findByUserOrderBySubmittedAtDesc(User user);

    /**
     * All assessment scores (PRE_TEST / POST_TEST) with the user eagerly
     * fetched, oldest first — used to compute per-student pre→post improvement.
     * Practice plays (modeType null or PRACTICE) are excluded.
     */
    @Query("select s from Score s join fetch s.user "
            + "where s.modeType in ('PRE_TEST','POST_TEST') "
            + "order by s.submittedAt asc")
    List<Score> findAssessmentScoresWithUser();
}
