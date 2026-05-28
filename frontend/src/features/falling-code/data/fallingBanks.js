// Falling Code word + line banks, split for Pre-Test / Practice / Post-Test.
//
// `words` are short keywords.
// `wrongWords` are { buggy, correct } pairs for the bug-bash phase.
// `codeLines` are full C lines that drop in the back half of the round.
// `buggyLines` are { buggy, correct } pairs for full-line bugs (missing
//   semicolons, wrong operators, etc.) — they drop like code lines but
//   display in red and require the corrected syntax to clear.
// `sequenceBlocks` are arrays of 2–3 consecutive lines that must be typed
//   in execution order when they drop together as a group.

export const practiceBank = {
    words: [
        "int", "float", "double", "char", "void", "return", "if", "else",
        "for", "while", "do", "switch", "case", "break", "continue",
        "printf", "scanf", "main", "include", "struct", "typedef",
        "const", "static", "sizeof", "true", "false", "long", "short",
    ],
    wrongWords: [
        { buggy: "pointr",     correct: "pointer" },
        { buggy: "funtion",    correct: "function" },
        { buggy: "paramater",  correct: "parameter" },
        { buggy: "arguement",  correct: "argument" },
        { buggy: "retrun",     correct: "return" },
        { buggy: "pirntf",     correct: "printf" },
        { buggy: "scnaf",      correct: "scanf" },
        { buggy: "incldue",    correct: "include" },
        { buggy: "strcut",     correct: "struct" },
        { buggy: "voild",      correct: "void" },
        { buggy: "flaot",      correct: "float" },
        { buggy: "chra",       correct: "char" },
    ],
    codeLines: [
        'printf("Hello!\\n");',
        'int x = 0;',
        'for (int i = 0; i < n; i++)',
        'if (x > 0) x++;',
        'scanf("%d", &n);',
        'while (i < 10) i++;',
        'int a[5];',
        'return 0;',
        'char c = \'A\';',
        '#include <stdio.h>',
    ],
    // Full-line bugs: display the buggy form, player must type the correct form.
    buggyLines: [
        { buggy: 'printf("Hello!\\n")',     correct: 'printf("Hello!\\n");' },
        { buggy: 'int x = 0',              correct: 'int x = 0;' },
        { buggy: 'if (x > 0) x++',         correct: 'if (x > 0) x++;' },
        { buggy: 'return 0',               correct: 'return 0;' },
        { buggy: 'int a[5]',               correct: 'int a[5];' },
        { buggy: 'scanf("%d", n);',         correct: 'scanf("%d", &n);' },
        { buggy: 'while (i < 10) i--',     correct: 'while (i < 10) i++;' },
    ],
    // Sequence blocks: 2–3 lines that must be typed in listed order.
    sequenceBlocks: [
        ['int a = 5;',          'int b = 3;',             'printf("%d", a + b);'],
        ['int x = 0;',          'x = x + 1;',             'printf("%d", x);'],
        ['char name[20];',      'scanf("%s", name);',     'printf("Hi %s", name);'],
        ['int n = 10;',         'for (int i = 0; i < n; i++)', 'printf("%d ", i);'],
        ['int *p = malloc(4);', '*p = 42;',               'free(p);'],
    ],
};

export const testBank = {
    words: [
        "malloc", "free", "NULL", "size_t", "uint8_t", "FILE",
        "fopen", "fclose", "fprintf", "fscanf", "memcpy", "memset",
        "strcmp", "strcpy", "strlen", "atoi", "atof", "exit",
        "register", "volatile", "extern", "union", "enum",
    ],
    wrongWords: [
        { buggy: "mallc",      correct: "malloc" },
        { buggy: "freee",      correct: "free" },
        { buggy: "NUUL",       correct: "NULL" },
        { buggy: "sizeoff",    correct: "sizeof" },
        { buggy: "stcmp",      correct: "strcmp" },
        { buggy: "memcopy",    correct: "memcpy" },
        { buggy: "fpritf",     correct: "fprintf" },
        { buggy: "fclos",      correct: "fclose" },
        { buggy: "exitt",      correct: "exit" },
        { buggy: "voltile",    correct: "volatile" },
        { buggy: "exterm",     correct: "extern" },
        { buggy: "tyepdef",    correct: "typedef" },
    ],
    codeLines: [
        'int *arr = malloc(n * sizeof(int));',
        'if (ptr != NULL) free(ptr);',
        'printf("Result: %d\\n", result);',
        'for (int i = 0; i < count; i++)',
        'struct Node *head = NULL;',
        'return EXIT_SUCCESS;',
        'typedef struct Point Point;',
        'fprintf(stderr, "Error\\n");',
        'memset(buffer, 0, sizeof(buffer));',
        'while ((c = getchar()) != EOF)',
        'const char *name = "syntaxtype";',
        'int main(int argc, char **argv)',
    ],
    buggyLines: [
        { buggy: 'int *arr = malloc(n * sizeof(int))',        correct: 'int *arr = malloc(n * sizeof(int));' },
        { buggy: 'if (ptr = NULL) free(ptr);',               correct: 'if (ptr != NULL) free(ptr);' },
        { buggy: 'return EXIT_FAILURE;',                     correct: 'return EXIT_SUCCESS;' },
        { buggy: 'memset(buffer, 1, sizeof(buffer));',       correct: 'memset(buffer, 0, sizeof(buffer));' },
        { buggy: 'struct Node *head = head;',                correct: 'struct Node *head = NULL;' },
        { buggy: 'const char *name = syntaxtype;',           correct: 'const char *name = "syntaxtype";' },
    ],
    sequenceBlocks: [
        ['int *arr = malloc(n * sizeof(int));', 'memset(arr, 0, n * sizeof(int));', 'free(arr);'],
        ['FILE *f = fopen("data.txt", "r");',   'fscanf(f, "%d", &n);',             'fclose(f);'],
        ['int len = strlen(str);',              'char *copy = malloc(len + 1);',    'strcpy(copy, str);'],
        ['int sum = 0;',                        'for (int i = 0; i < n; i++)',      'sum += arr[i];'],
        ['struct Node *node = malloc(sizeof(struct Node));', 'node->data = val;',   'node->next = NULL;'],
    ],
};

// Convenience: assemble a challenge-shaped object the existing game accepts.
// `mode` is one of MODE.PRE_TEST / PRACTICE / POST_TEST.
export const buildChallengeForMode = (mode) => {
    const isPractice = mode === "PRACTICE";
    const bank = isPractice ? practiceBank : testBank;
    return {
        challengeId: `__${mode.toLowerCase()}__`,
        id:          `__${mode.toLowerCase()}__`,
        title:       isPractice ? "Practice Run" : (mode === "PRE_TEST" ? "Pre-Test Run" : "Final Run"),
        words:           bank.words,
        wrongWords:      bank.wrongWords,
        codeLines:       bank.codeLines,
        buggyLines:      bank.buggyLines,
        sequenceBlocks:  bank.sequenceBlocks,
        testTimer: isPractice ? 90 : 60,
        speed:     1,
        maxLives:  isPractice ? 5 : 3,
    };
};
