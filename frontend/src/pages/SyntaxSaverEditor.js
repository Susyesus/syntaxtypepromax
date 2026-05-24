import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Divider,
    Alert,
    useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_BASE } from "../utils/api";
import { authFetch } from "../utils/authFetch";

const emptyStep = (order) => ({
    stepOrder: order,
    type: "MATCH",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    parts: [],
});

export default function SyntaxSaverEditor() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [status, setStatus] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const loadQuizzes = async () => {
        try {
            const res = await authFetch(`${API_BASE}/api/syntax-saver/teacher`);
            if (!res.ok) throw new Error(`${res.status}`);
            setQuizzes(await res.json());
        } catch (e) {
            setStatus({ text: "Failed to load quizzes: " + e.message, type: "error" });
        }
    };

    useEffect(() => { loadQuizzes(); }, []);

    const loadQuizForEdit = async (id) => {
        try {
            const res = await authFetch(`${API_BASE}/api/syntax-saver/teacher/${id}`);
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            setSelectedId(id);
            setDraft({
                ...data,
                steps: data.steps.map(normalizeStep),
            });
        } catch (e) {
            setStatus({ text: "Failed to load quiz: " + e.message, type: "error" });
        }
    };

    const normalizeStep = (s) => ({
        ...s,
        options: s.options || ["", "", "", ""],
        parts: s.parts || [],
        correctAnswer: s.correctAnswer || "",
    });

    const newQuiz = () => {
        setSelectedId(null);
        setDraft({
            title: "",
            description: "",
            steps: [emptyStep(0)],
        });
        setStatus({ text: "", type: "" });
    };

    const save = async () => {
        if (!draft.title.trim()) {
            setStatus({ text: "Title is required.", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const url = selectedId
                ? `${API_BASE}/api/syntax-saver/${selectedId}`
                : `${API_BASE}/api/syntax-saver`;
            const method = selectedId ? "PUT" : "POST";
            const res = await authFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            if (!res.ok) throw new Error(`${res.status}`);
            const saved = await res.json();
            setSelectedId(saved.id);
            setDraft({ ...saved, steps: saved.steps.map(normalizeStep) });
            setStatus({ text: "Saved.", type: "success" });
            loadQuizzes();
        } catch (e) {
            setStatus({ text: "Save failed: " + e.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
        try {
            const res = await authFetch(`${API_BASE}/api/syntax-saver/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`${res.status}`);
            if (selectedId === id) {
                setSelectedId(null);
                setDraft(null);
            }
            setStatus({ text: "Deleted.", type: "success" });
            loadQuizzes();
        } catch (e) {
            setStatus({ text: "Delete failed: " + e.message, type: "error" });
        }
    };

    const updateStep = (idx, patch) => {
        setDraft({
            ...draft,
            steps: draft.steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
        });
    };

    const addStep = () => {
        setDraft({
            ...draft,
            steps: [...draft.steps, emptyStep(draft.steps.length)],
        });
    };

    const removeStep = (idx) => {
        setDraft({
            ...draft,
            steps: draft.steps
                .filter((_, i) => i !== idx)
                .map((s, i) => ({ ...s, stepOrder: i })),
        });
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <IconButton onClick={() => navigate("/instructor")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
                        Syntax Saver Editor
                    </Typography>
                </Stack>

                {status.text && (
                    <Alert severity={status.type || "info"} sx={{ mb: 2 }} onClose={() => setStatus({ text: "", type: "" })}>
                        {status.text}
                    </Alert>
                )}

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    {/* List */}
                    <Card sx={{ flex: "0 0 320px" }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6">Quizzes</Typography>
                                <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={newQuiz}>
                                    New
                                </Button>
                            </Stack>
                            {quizzes.length === 0 && (
                                <Typography variant="body2" color="text.secondary">No quizzes yet.</Typography>
                            )}
                            <Stack spacing={1}>
                                {quizzes.map(q => (
                                    <Box
                                        key={q.id}
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: selectedId === q.id ? "primary.main" : "divider",
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            "&:hover": { borderColor: "primary.main" },
                                        }}
                                        onClick={() => loadQuizForEdit(q.id)}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="subtitle2">{q.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {q.steps.length} step{q.steps.length === 1 ? "" : "s"}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => { e.stopPropagation(); remove(q.id); }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Editor */}
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            {!draft ? (
                                <Typography color="text.secondary">
                                    Select a quiz on the left, or click <strong>New</strong> to create one.
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    <TextField
                                        label="Title"
                                        value={draft.title}
                                        onChange={e => setDraft({ ...draft, title: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Description"
                                        value={draft.description || ""}
                                        onChange={e => setDraft({ ...draft, description: e.target.value })}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                    />

                                    <Divider />

                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">Steps</Typography>
                                        <Button size="small" startIcon={<AddIcon />} onClick={addStep}>
                                            Add Step
                                        </Button>
                                    </Stack>

                                    {draft.steps.map((step, idx) => (
                                        <Card key={idx} variant="outlined">
                                            <CardContent>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle2">Step {idx + 1}</Typography>
                                                        <IconButton size="small" color="error" onClick={() => removeStep(idx)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>

                                                    <FormControl size="small" sx={{ width: 200 }}>
                                                        <InputLabel>Type</InputLabel>
                                                        <Select
                                                            label="Type"
                                                            value={step.type}
                                                            onChange={e => updateStep(idx, { type: e.target.value })}
                                                        >
                                                            <MenuItem value="MATCH">Match (multiple choice)</MenuItem>
                                                            <MenuItem value="REORDER">Reorder (drag to order)</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    <TextField
                                                        label="Question"
                                                        value={step.question}
                                                        onChange={e => updateStep(idx, { question: e.target.value })}
                                                        fullWidth
                                                        multiline
                                                    />

                                                    {step.type === "MATCH" && (
                                                        <>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Options (mark one as the correct answer below)
                                                            </Typography>
                                                            {step.options.map((opt, oi) => (
                                                                <Stack key={oi} direction="row" spacing={1}>
                                                                    <TextField
                                                                        size="small"
                                                                        value={opt}
                                                                        onChange={e => {
                                                                            const next = [...step.options];
                                                                            next[oi] = e.target.value;
                                                                            updateStep(idx, { options: next });
                                                                        }}
                                                                        fullWidth
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            const next = step.options.filter((_, i) => i !== oi);
                                                                            updateStep(idx, { options: next });
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Stack>
                                                            ))}
                                                            <Button
                                                                size="small"
                                                                onClick={() => updateStep(idx, { options: [...step.options, ""] })}
                                                            >
                                                                Add option
                                                            </Button>
                                                            <TextField
                                                                label="Correct answer (must match one of the options exactly)"
                                                                value={step.correctAnswer}
                                                                onChange={e => updateStep(idx, { correctAnswer: e.target.value })}
                                                                fullWidth
                                                            />
                                                        </>
                                                    )}

                                                    {step.type === "REORDER" && (
                                                        <>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Code parts in the CORRECT order — they will be shuffled for the student
                                                            </Typography>
                                                            {step.parts.map((p, pi) => (
                                                                <Stack key={pi} direction="row" spacing={1}>
                                                                    <TextField
                                                                        size="small"
                                                                        value={p}
                                                                        onChange={e => {
                                                                            const next = [...step.parts];
                                                                            next[pi] = e.target.value;
                                                                            updateStep(idx, { parts: next });
                                                                        }}
                                                                        fullWidth
                                                                        sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            const next = step.parts.filter((_, i) => i !== pi);
                                                                            updateStep(idx, { parts: next });
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Stack>
                                                            ))}
                                                            <Button
                                                                size="small"
                                                                onClick={() => updateStep(idx, { parts: [...step.parts, ""] })}
                                                            >
                                                                Add part
                                                            </Button>
                                                        </>
                                                    )}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Divider />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={save}
                                        disabled={loading}
                                    >
                                        {selectedId ? "Update" : "Create"}
                                    </Button>
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </Box>
    );
}
