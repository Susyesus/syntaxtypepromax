import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { API_BASE } from "../utils/api";
import { authFetch } from "../utils/authFetch";

const GAME_AREA_HEIGHT = 650;

/**
 * Bug Smasher (SDD §3.1.2).
 * Falling-block engine that interleaves the Challenge.words pool (correct tokens)
 * with the Challenge.wrongWords pool (corrupted C tokens). Typing a wrong word
 * costs a life when Challenge.useLives is true. Missed correct words also cost a life.
 * Validation is client-side, case-sensitive string equality.
 */
const AdvancedFallingTypingTest = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [gameDuration, setGameDuration] = useState(60);
    const [timeLeft, setTimeLeft] = useState(60);
    const [availableWords, setAvailableWords] = useState([]);
    const [wrongWordsPool, setWrongWordsPool] = useState([]);
    const [fallingWords, setFallingWords] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [activeWordId, setActiveWordId] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [lives, setLives] = useState(null);
    const [useLives, setUseLives] = useState(false);
    const [speed, setSpeed] = useState(1);

    const wordIdCounter = useRef(0);
    const fallingWordsRef = useRef([]);
    const speedRef = useRef(1);
    const useLivesRef = useRef(false);
    const isGameOverRef = useRef(false);
    const availableRef = useRef([]);
    const wrongRef = useRef([]);

    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { useLivesRef.current = useLives; }, [useLives]);
    useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
    useEffect(() => { availableRef.current = availableWords; }, [availableWords]);
    useEffect(() => { wrongRef.current = wrongWordsPool; }, [wrongWordsPool]);

    // Sync ref with state in one place — single source of truth
    const updateFallingWords = (next) => {
        const value = typeof next === "function" ? next(fallingWordsRef.current) : next;
        fallingWordsRef.current = value;
        setFallingWords(value);
    };

    useEffect(() => {
        const raw = JSON.parse(sessionStorage.getItem("fallingGameConfig"));
        const config = raw?.config || raw;
        if (!config) return;

        setAvailableWords(config.words || []);
        setWrongWordsPool(config.wrongWords || []);
        setGameDuration(config.duration || 60);
        setTimeLeft(config.duration || 60);
        setSpeed(config.speed || 1);

        if (config.useLives) {
            setUseLives(true);
            setLives(config.maxLives);
        } else {
            setUseLives(false);
            setLives(null);
        }
    }, []);

    useEffect(() => {
        if (!isGameOver) return;
        authFetch(`${API_BASE}/api/scores/falling`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                score,
                timeInSeconds: gameDuration,
                challengeType: "advanced_falling_typing_test",
            }),
        }).catch(err => console.error("Score submit failed:", err));
    }, [isGameOver, score, gameDuration]);

    useEffect(() => {
        if (isGameOver || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isGameOver]);

    // Spawn loop — deps are intentionally empty so the loop doesn't restart on speed/useLives changes
    useEffect(() => {
        if (isGameOverRef.current) return;
        let timeoutId;

        const spawn = () => {
            if (isGameOverRef.current) return;
            const onScreen = new Set(fallingWordsRef.current.map(w => w.text));
            const uniqueAvail = availableRef.current.filter(w => !onScreen.has(w));
            const uniqueWrong = wrongRef.current.filter(w => !onScreen.has(w));
            if (uniqueAvail.length === 0 && uniqueWrong.length === 0) {
                timeoutId = setTimeout(spawn, 1000);
                return;
            }

            const batchSize = Math.floor(Math.random() * 4) + 3;
            const newWords = [];
            const availCopy = [...uniqueAvail];
            const wrongCopy = [...uniqueWrong];

            for (let i = 0; i < batchSize; i++) {
                const pickWrong = Math.random() < 0.30 && wrongCopy.length > 0;
                const pool = pickWrong ? wrongCopy : (availCopy.length > 0 ? availCopy : wrongCopy);
                if (pool.length === 0) continue;
                const idx = Math.floor(Math.random() * pool.length);
                const text = pool.splice(idx, 1)[0];
                newWords.push({
                    id: wordIdCounter.current++,
                    text,
                    y: 0,
                    x: 8 + Math.random() * 80,
                    isWrong: pickWrong,
                });
            }
            if (newWords.length) {
                updateFallingWords(prev => [...prev, ...newWords]);
            }
            const nextInterval = (Math.random() * 5000 + 8000) / speedRef.current;
            timeoutId = setTimeout(spawn, nextInterval);
        };

        const startTimer = setTimeout(spawn, 500);
        return () => {
            clearTimeout(startTimer);
            clearTimeout(timeoutId);
        };
    }, []);

    // Animation loop
    useEffect(() => {
        let rafId;
        let lastTime = performance.now();

        const tick = (now) => {
            if (isGameOverRef.current) return;
            const dt = (now - lastTime) / 16.67;
            lastTime = now;

            let livesLost = 0;
            const next = [];
            for (const w of fallingWordsRef.current) {
                const newY = w.y + 0.09 * speedRef.current * dt;
                if (newY > GAME_AREA_HEIGHT) {
                    if (useLivesRef.current && !w.isWrong) livesLost += 1;
                    continue;
                }
                next.push({ ...w, y: newY });
            }
            updateFallingWords(next);

            if (livesLost > 0 && useLivesRef.current) {
                setLives(prev => {
                    const remaining = (prev ?? 0) - livesLost;
                    if (remaining <= 0) {
                        setIsGameOver(true);
                        return 0;
                    }
                    return remaining;
                });
                setStreak(0);
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setCurrentInput(value);
        if (value === "") {
            setActiveWordId(null);
            return;
        }
        const match = fallingWordsRef.current.find(w => w.text.startsWith(value));
        if (!match) {
            setActiveWordId(null);
            return;
        }
        setActiveWordId(match.id);
        if (value !== match.text) return;

        // Word fully typed
        setTotalChars(prev => prev + match.text.length);
        if (match.isWrong) {
            // Bug Smasher: typing a corrupted token is a trap
            setCorrectChars(prev => prev); // wrong-word chars are not "correct" toward accuracy
            setStreak(0);
            if (useLivesRef.current) {
                setLives(prev => {
                    const remaining = (prev ?? 0) - 1;
                    if (remaining <= 0) {
                        setIsGameOver(true);
                        return 0;
                    }
                    return remaining;
                });
            }
        } else {
            setCorrectChars(prev => prev + match.text.length);
            const newStreak = streak + 1;
            const multiplier = 1 + Math.floor(newStreak / 5);
            setStreak(newStreak);
            setBestStreak(prev => Math.max(prev, newStreak));
            setScore(prev => prev + 10 * multiplier);
        }
        updateFallingWords(prev => prev.filter(w => w.id !== match.id));
        setCurrentInput("");
        setActiveWordId(null);
    };

    const handleRestart = () => {
        const raw = JSON.parse(sessionStorage.getItem("fallingGameConfig"));
        const config = raw?.config || raw;
        updateFallingWords([]);
        setCurrentInput("");
        setActiveWordId(null);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setCorrectChars(0);
        setTotalChars(0);
        setIsGameOver(false);
        wordIdCounter.current = 0;
        if (config) {
            setAvailableWords(config.words || []);
            setWrongWordsPool(config.wrongWords || []);
            setGameDuration(config.duration || 60);
            setTimeLeft(config.duration || 60);
            setSpeed(config.speed || 1);
            if (config.useLives) {
                setUseLives(true);
                setLives(config.maxLives);
            } else {
                setUseLives(false);
                setLives(null);
            }
        }
    };

    const renderWord = (word) => {
        if (word.id !== activeWordId) return word.text;
        return [...word.text].map((char, i) => (
            <span key={i} style={{ color: currentInput[i] === char ? "#7CFC00" : "#FFD93D" }}>
                {char}
            </span>
        ));
    };

    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                color: "text.primary",
                py: 4,
                px: { xs: 2, md: 4 },
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -120,
                    left: -120,
                    width: 360,
                    height: 360,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #C8456D 0%, transparent 70%)",
                    opacity: isDark ? 0.18 : 0.10,
                    filter: "blur(28px)",
                    pointerEvents: "none",
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -150,
                    right: -150,
                    width: 420,
                    height: 420,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #FFC700 0%, transparent 70%)",
                    opacity: isDark ? 0.15 : 0.10,
                    filter: "blur(32px)",
                    pointerEvents: "none",
                },
            }}
        >
            <Box sx={{ maxWidth: 1100, mx: "auto", position: "relative", zIndex: 1 }}>
                <Typography variant="h4" sx={{ mb: 1, fontFamily: "'Pixelify Sans', sans-serif" }}>
                    Bug Smasher
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "warning.main", fontWeight: 600 }}>
                    Type the correct C tokens. <span style={{ color: "#FF4444" }}>Red words are bugs — DON'T type them.</span>
                </Typography>

                <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: "wrap" }}>
                    <Typography><strong>Score:</strong> {score}</Typography>
                    <Typography><strong>Time:</strong> {timeLeft}s</Typography>
                    <Typography><strong>Streak:</strong> {streak}x{1 + Math.floor(streak / 5)}</Typography>
                    <Typography><strong>Accuracy:</strong> {accuracy}%</Typography>
                    {useLives && <Typography><strong>Lives:</strong> {"❤".repeat(Math.max(lives ?? 0, 0))}</Typography>}
                </Stack>

                <Box
                    sx={{
                        position: "relative",
                        height: `${GAME_AREA_HEIGHT}px`,
                        overflow: "hidden",
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: isDark ? "#2a2a3e" : "#d0d0e0",
                        bgcolor: isDark ? "#0F0F1E" : "#1a1a2e",
                        backgroundImage:
                            "linear-gradient(to bottom, rgba(200,69,109,0.04) 0%, transparent 50%, rgba(255,199,0,0.04) 100%)",
                    }}
                >
                    {fallingWords.map(word => (
                        <Box
                            key={word.id}
                            sx={{
                                position: "absolute",
                                top: `${word.y}px`,
                                left: `${word.x}%`,
                                fontSize: "20px",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: word.isWrong ? 700 : 500,
                                color: word.isWrong ? "#FF4444" : "#FFD93D",
                                textShadow: word.isWrong
                                    ? "0 0 8px rgba(255,68,68,0.5)"
                                    : "0 0 4px rgba(255,217,61,0.3)",
                                userSelect: "none",
                            }}
                        >
                            {renderWord(word)}
                        </Box>
                    ))}

                    {isGameOver && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                bgcolor: "rgba(0,0,0,0.85)",
                                p: 4,
                                borderRadius: 2,
                                textAlign: "center",
                                color: "white",
                                minWidth: 320,
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2, fontFamily: "'Pixelify Sans', sans-serif" }}>
                                Game Over
                            </Typography>
                            <Typography sx={{ mb: 1 }}>Final Score: {score}</Typography>
                            <Typography sx={{ mb: 1 }}>Accuracy: {accuracy}%</Typography>
                            <Typography sx={{ mb: 2 }}>Best Streak: {bestStreak}</Typography>
                            <Button variant="contained" color="primary" onClick={handleRestart}>
                                Restart
                            </Button>
                        </Box>
                    )}
                </Box>

                {!isGameOver && (
                    <input
                        type="text"
                        placeholder="Start typing... (avoid red trap words)"
                        value={currentInput}
                        onChange={handleInputChange}
                        autoFocus
                        style={{
                            width: "100%",
                            marginTop: "1rem",
                            padding: "12px",
                            fontSize: "16px",
                            fontFamily: "'JetBrains Mono', monospace",
                            border: "2px solid #C8456D",
                            borderRadius: "8px",
                            background: isDark ? "#1a1a2e" : "#fff",
                            color: isDark ? "#fff" : "#1a1a2e",
                            outline: "none",
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export default AdvancedFallingTypingTest;
