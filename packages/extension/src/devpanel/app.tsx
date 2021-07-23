import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

type Message = {
  node: string;
  message: string;
  rule: string;
};

const id = chrome.devtools.inspectedWindow.tabId;

const bgConnection = chrome.runtime.connect({
  name: id ? id.toString() : undefined,
});

export default function App() {
  const [errors, setErrors] = useState<Message[]>([]);
  const [warnings, setWarnings] = useState<Message[]>([]);
  const [fixes, setFixes] = useState<Message[]>([]);
  const [passes, setPasses] = useState<Message[]>([]);
  const [hasTraversed, setHasTraversed] = useState(false);
  const totalIssues = errors.length + warnings.length;

  const testsPassed = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round((passes.length / (totalIssues + passes.length)) * 100);
  }, [totalIssues, passes]);

  const unfixableErrors = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round((errors.length / totalIssues) * 100);
  }, [totalIssues, errors]);

  const issuesFixed = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round((fixes.length / totalIssues) * 100);
  }, [fixes, totalIssues]);

  const handleMessage = (data: any, port: chrome.runtime.Port) => {
    if (data.id !== id) return;

    const {
      node,
      message,
      name: rule,
    } = data.message.payload.payload as Record<string, string>;

    const newMessage: Message = { message, node, rule };

    switch (data?.message.payload.event) {
      case 'error': {
        setErrors(errors => [...errors, newMessage]);
        break;
      }
      case 'fix': {
        setFixes(fixes => [...fixes, newMessage]);
        break;
      }
      case 'warn': {
        setWarnings(warnings => [...warnings, newMessage]);
        break;
      }
      case 'pass': {
        setPasses(passes => [...passes, newMessage]);
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
    chrome.devtools.inspectedWindow.reload({});
    setErrors([]);
    setWarnings([]);
    setFixes([]);
    setPasses([]);
    setHasTraversed(true);

    bgConnection.postMessage({
      source: '@devtools-extension',
      payload: {
        event: 'start',
        payload: undefined,
      },
    });
  };

  const issuesFixedProgress = (
    <Progress href="#info" title="Fixes" value={issuesFixed} color="blue.300" />
  );
  const testsPassedProgress = (
    <Progress
      href="#success"
      title="Passing"
      value={testsPassed}
      color="green.400"
    />
  );
  const unfixableErrorsProgress = (
    <Progress
      href="#error"
      title="Errors"
      value={unfixableErrors}
      color="red.400"
    />
  );

  return (
    <Box>
      <HStack py="20px" fontSize="xl" justifyContent="center">
        {unfixableErrorsProgress}
        {issuesFixedProgress}
        {testsPassedProgress}
      </HStack>
      <Flex w="100%" direction="column">
        <Button my="14px" w="fit-content" mx="auto" onClick={handleStart}>
          {hasTraversed ? 'Restart' : 'Start'}
        </Button>
        <Section
          status="error"
          progress={unfixableErrorsProgress}
          messages={errors}
        />
        {/* <Section title="Warnings" status="warning" messages={warnings} /> */}
        <Section
          status="info"
          progress={issuesFixedProgress}
          messages={fixes}
        />
        <Section
          status="success"
          progress={testsPassedProgress}
          messages={passes}
        />
      </Flex>
    </Box>
  );
}

function Section({
  messages,
  status,
  progress,
}: {
  messages: Message[];
  status: AlertStatus;
  progress: React.ReactElement;
}) {
  const href = `#${status}`;

  return (
    <Box id={href} borderTop="1px" borderColor="gray.700">
      <Box padding="12px" maxW="calc(60 * 12px)" m="0 auto">
        <Box fontSize="2xl" mb="8px">
          <Box maxW="400px" w="auto" m="0px auto">
            {progress}
          </Box>
        </Box>
        <Stack spacing={3}>
          {messages.map((message, index) => (
            <Message
              key={index}
              index={index}
              message={message}
              status={status}
            />
          ))}
        </Stack>
      </Box>
    </Box>
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
      <Alert cursor="pointer" onClick={() => setOpen(!isOpen)} status={status}>
        <AlertIcon />
        <AlertDescription>
          <Text fontWeight="600">{message.rule}</Text>
          {message.message}
        </AlertDescription>
      </Alert>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            exit="collapsed"
            animate="open"
            variants={{
              open: {
                opacity: 1,
                height: 'auto',
              },
              collapsed: {
                opacity: 0,
                height: 0,
              },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.6, 0.2, 0.9] }}
          >
            <Box background="gray.700" p="10px 12px">
              <Text
                cursor="pointer"
                fontFamily="monospace"
                fontSize="12px"
                onClick={handleInspect}
              >
                {message.node}
              </Text>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Progress({
  value,
  color,
  title,
  href,
}: {
  value: number;
  color: string;
  title: string;
  href: string;
}) {
  return (
    <Flex
      as="a"
      direction="column"
      align="center"
      href={href}
      textDecor="none"
      p="8px"
    >
      <CircularProgress size={100} value={value} color={color}>
        <CircularProgressLabel>{value}</CircularProgressLabel>
      </CircularProgress>
      <Text marginTop="14px">{title}</Text>
    </Flex>
  );
}
