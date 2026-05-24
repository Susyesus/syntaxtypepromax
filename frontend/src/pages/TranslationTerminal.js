import React, { useState, useMemo } from "react";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    CircularProgress,
    useTheme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import codeChallenges from "./codeChallenges";
import CodeDiffView from "../components/CodeDiffView";
import { tokensEqual } from "../utils/codeCompare";
import { runCCode } from "./judge0";

/**
 * Translation Terminal (SDD §3.1.4 M3).
 *
 * Free-form C-code authoring page that pairs a natural-language prompt with a
 * full code editor. On submit, the student's code is:
 *   1. compared against the canonical solution via tokensEqual (whitespace-
 *      normalising, configurable case sensitivity)
 *   2. optionally executed on Judge0 to surface compile/runtime feedback
 *   3. rendered side-by-side as a line diff for mismatches.
 *
 * The challenge bank comes from codeChallenges.js — the same source used by
 * TypingTest Code Test mode. Here we reconstruct the canonical solution by
 * substituting the blanks back in.
 */

function reconstructSolution(challenge) {
    if (!challenge) return "";
    const parts = (challenge.code || "").split("___");
    const answers = challenge.answers || [];
    let out = "";
    for (let i = 0; i < parts.length; i++) {
        out += parts[i];
        if (i < parts.length - 1) out += answers[i] ?? "___";
    }
    return out;
}

const STARTER = `#include <stdio.h>

int main() {
    // Your code here

    return 0;
}
`;

export default function TranslationTerminal() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [challengeId, setChallengeId] = useState(codeChallenges[0]?.id ?? null);
    const [userCode, setUserCode] = useState(STARTER);
    const [judgeResult, setJudgeResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [showDiff, setShowDiff] = useState(false);

    const challenge = useMemo(
        () => codeChallenges.find(c => c.id === challengeId) ?? codeChallenges[0],
        [challengeId]
    );
    const solution = useMemo(() => reconstructSolution(challenge), [challenge]);
    const equivalent = useMemo(
        () => tokensEqual(solution, userCode),
        [solution, userCode]
    );

    const onPickChallenge = (id) => {
        setChallengeId(id);
        setUserCode(STARTER);
        setJudgeResult(null);
        setShowDiff(false);
    };

    const run = async () => {
        setRunning(true);
        setJudgeResult(null);
        try {
            const r = await runCCode(userCode);
            setJudgeResult(r);
        } catch (e) {
            setJudgeResult({ error: e.message || "Execution failed" });
        } finally {
            setRunning(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
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
            <Box sx={{ maxWidth: 1300, mx: "auto", position: "relative", zIndex: 1 }}>
                <Typography variant="h4" sx={{ mb: 1, fontFamily: "'Pixelify Sans', sans-serif" }}>
                    Translation Terminal
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                    Read the prompt, write the C code, and compare against the canonical solution
                    with whitespace-normalising token equality.
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }}>
                    <FormControl sx={{ minWidth: 320 }}>
                        <InputLabel>Challenge</InputLabel>
                        <Select
                            label="Challenge"
                            value={challengeId ?? ""}
                            onChange={e => onPickChallenge(e.target.value)}
                        >
                            {codeChallenges.map(c => (
                                <MenuItem key={c.id} value={c.id}>
                                    [{c.difficulty}] {c.question}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Chip
                        label={equivalent ? "Token-equivalent to solution" : "Not yet equivalent"}
                        color={equivalent ? "success" : "default"}
                        variant={equivalent ? "filled" : "outlined"}
                    />
                </Stack>

                <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
                    {/* Prompt */}
                    <Card sx={{ flex: "0 0 360px" }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary">Prompt</Typography>
                            <Typography variant="h6" sx={{ mb: 2 }}>{challenge?.question}</Typography>
                            <Chip size="small" label={challenge?.difficulty} sx={{ mb: 2 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                Hint: the canonical solution uses standard C library calls. The
                                token comparator is whitespace-tolerant — formatting does not affect equality.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Editor + actions */}
                    <Card sx={{ flex: 1, minWidth: 0 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="overline" color="text.secondary">Your code</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<CompareArrowsIcon />}
                                        onClick={() => setShowDiff(s => !s)}
                                    >
                                        {showDiff ? "Hide diff" : "Compare"}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={running ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                                        onClick={run}
                                        disabled={running}
                                    >
                                        Run
                                    </Button>
                                </Stack>
                            </Stack>
                            <textarea
                                value={userCode}
                                onChange={e => setUserCode(e.target.value)}
                                spellCheck={false}
                                style={{
                                    width: "100%",
                                    minHeight: 360,
                                    padding: 12,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    border: "1px solid",
                                    borderColor: isDark ? "#2a2a3e" : "#d0d0e0",
                                    borderRadius: 6,
                                    background: isDark ? "#0F0F1E" : "#fff",
                                    color: isDark ? "#fff" : "#1a1a2e",
                                    outline: "none",
                                    resize: "vertical",
                                    tabSize: 4,
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        const t = e.target;
                                        const s = t.selectionStart, en = t.selectionEnd;
                                        const next = userCode.slice(0, s) + "    " + userCode.slice(en);
                                        setUserCode(next);
                                        requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; });
                                    }
                                }}
                            />

                            {judgeResult && (
                                <Alert
                                    severity={judgeResult.error || judgeResult.stderr ? "error" : "success"}
                                    sx={{ mt: 2, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}
                                >
                                    {judgeResult.error
                                        ? judgeResult.error
                                        : (judgeResult.compile_output || judgeResult.stderr || judgeResult.stdout || judgeResult.status || "(no output)")}
                                </Alert>
                            )}

                            {showDiff && (
                                <Box sx={{ mt: 2 }}>
                                    <CodeDiffView expected={solution} actual={userCode} />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </Box>
    );
}
