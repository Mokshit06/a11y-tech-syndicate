import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Stack,
  Text,
  AlertStatus,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import create from 'zustand';

type Message = {
  node: string;
  message: string;
  rule: string;
};

type AccessibilityStats = {
  errors: Message[];
  warnings: Message[];
  fixes: Message[];
  passed: Message[];
  addError(error: Message): void;
  addWarning(warning: Message): void;
  addFix(pass: Message): void;
  addPass(fix: Message): void;
  clear(): void;
};

const useAccessibilityStats = create<AccessibilityStats>(set => ({
  errors: [],
  warnings: [],
  fixes: [],
  passed: [],
  addError(error) {
    set(state => ({
      ...state,
      errors: [...state.errors, error],
    }));
  },
  addWarning(warning) {
    set(state => ({
      ...state,
      warnings: [...state.warnings, warning],
    }));
  },
  addPass(pass) {
    set(state => ({
      ...state,
      passed: [...state.passed, pass],
    }));
  },
  addFix(fix) {
    set(state => ({
      ...state,
      fixes: [...state.fixes, fix],
    }));
  },
  clear() {
    set(state => ({
      ...state,
      errors: [],
      warnings: [],
      fixes: [],
      passed: [],
    }));
  },
}));

const id = chrome.devtools.inspectedWindow.tabId;

const bgConnection = chrome.runtime.connect({
  name: id ? id.toString() : undefined,
});

export default function App() {
  const {
    errors,
    fixes,
    warnings,
    addError,
    addFix,
    addWarning,
    clear,
    addPass,
    passed,
  } = useAccessibilityStats();
  const [hasTraversed, setHasTraversed] = useState(false);
  const totalIssues = errors.length + warnings.length;

  const testsPassed = useMemo(() => {
    if (!hasTraversed) return 0;

    if (totalIssues === 0) return 0;

    return Math.round((passed.length / totalIssues + passed.length) * 100);
  }, [totalIssues, hasTraversed, passed]);

  const unfixableErrors = useMemo(() => {
    if (!hasTraversed) return 0;

    if (totalIssues === 0) return 0;

    return Math.round((errors.length / totalIssues) * 100);
  }, [hasTraversed, totalIssues, errors]);

  const issuesFixed = useMemo(() => {
    if (!hasTraversed) return 0;

    if (totalIssues === 0) return 0;

    return Math.round((fixes.length / totalIssues) * 100);
  }, [fixes, hasTraversed, totalIssues]);

  const handleMessage = (data: any, port: chrome.runtime.Port) => {
    if (data.id !== id) return;

    const {
      node,
      message,
      name: rule,
    } = data.message.payload.payload as Record<string, string>;

    const newMessage: Message = { message, node, rule };

    switch (data?.message.payload.event) {
      case 'end': {
        setHasTraversed(true);
        break;
      }
      case 'error': {
        addError(newMessage);
        break;
      }
      case 'fix': {
        addFix(newMessage);
        break;
      }
      case 'warn': {
        addWarning(newMessage);
        break;
      }
      case 'pass': {
        addPass(newMessage);
        break;
      }
    }
  };

  useEffect(() => {
    bgConnection.onMessage.addListener(handleMessage);

    return () => {
      bgConnection.onMessage.removeListener(handleMessage);
    };
  });

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    chrome.devtools.inspectedWindow.eval('window.location.reload()', () => {
      clear();
      setHasTraversed(false);

      bgConnection.postMessage({
        source: '@devtools-extension',
        payload: {
          event: 'start',
          payload: undefined,
        },
      });
    });
  };

  return (
    <Box>
      <Box>
        <CircularProgress size={100} value={testsPassed} color="green.400">
          <CircularProgressLabel>
            {hasTraversed && testsPassed}
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
      <Box>
        <CircularProgress size={100} value={issuesFixed} color="green.400">
          <CircularProgressLabel>
            {hasTraversed && issuesFixed}
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
      <Box>
        <CircularProgress size={100} value={unfixableErrors} color="green.400">
          <CircularProgressLabel>
            {hasTraversed && unfixableErrors}
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
      <Button onClick={handleStart}>Start</Button>
      <Section title="Passed" status="success" messages={passed} />
      <Section title="Warnings" status="warning" messages={warnings} />
      <Section title="Errors" status="error" messages={errors} />
      <Section title="Fixes" status="info" messages={fixes} />
    </Box>
  );
}

function Section({
  title,
  messages,
  status,
}: {
  title: string;
  messages: Message[];
  status: AlertStatus;
}) {
  return (
    <div>
      <div>
        <Text fontSize="2xl">{title}</Text>
      </div>
      <Stack spacing={2}>
        {messages.map((message, index) => (
          <Message
            key={index}
            index={index}
            message={message}
            status={status}
          />
        ))}
      </Stack>
    </div>
  );
}

const statusToProperty = {
  error: 'errors',
  warning: 'warnings',
  success: 'passed',
  info: 'fixes',
};

function Message({
  message,
  status,
  index,
}: {
  message: Message;
  index: number;
  status: AlertStatus;
}) {
  const [isOpen, setOpen] = useState(false);

  const handleInspect = () => {
    chrome.devtools.inspectedWindow.eval(
      // pageScript adds nodes to window
      // (inspect(window.__A11Y_EXTENSION__.errors[0]))
      `(inspect(window.__A11Y_EXTENSION__.${statusToProperty[status]}[${index}]))`
    );
  };

  return (
    <div>
      <Alert onClick={() => setOpen(!isOpen)} status={status}>
        <AlertIcon />
        <AlertDescription>
          <Text fontWeight="600">{message.rule}</Text>
          {message.message}
        </AlertDescription>
      </Alert>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            key="content"
            initial="collapsed"
            exit="collapsed"
            animate="open"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <Text onClick={handleInspect}>{message.node}</Text>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
