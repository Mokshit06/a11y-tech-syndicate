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
import { A11yResults, Action, Result } from '../types';

const id = chrome.devtools.inspectedWindow.tabId;

const bgConnection = chrome.runtime.connect({
  name: id ? id.toString() : undefined,
});

const initialResults: A11yResults = {
  errors: [],
  passes: [],
  fixes: [],
  warnings: [],
};

export default function App() {
  const [results, setResults] = useState<A11yResults>(initialResults);
  const [hasTraversed, setHasTraversed] = useState(false);
  const [traversing, setTraversing] = useState(false);

  const totalIssues = results.errors.length + results.warnings.length;

  const testsPassed = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round(
      (results.passes.length / (totalIssues + results.passes.length)) * 100
    );
  }, [totalIssues, results.passes]);

  const unfixableErrors = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round((results.errors.length / totalIssues) * 100);
  }, [totalIssues, results.errors]);

  const issuesFixed = useMemo(() => {
    if (totalIssues === 0) return 0;

    return Math.round((results.fixes.length / totalIssues) * 100);
  }, [totalIssues, results.fixes]);

  const handleMessage = (data: Action, port: chrome.runtime.Port) => {
    if (data.id !== id) return;

    const results = data.message.payload;
    setResults(results);
    setTraversing(false);
  };

  useEffect(() => {
    bgConnection.onMessage.addListener(handleMessage);

    return () => {
      bgConnection.onMessage.removeListener(handleMessage);
    };
  });

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTraversing(true);
    chrome.devtools.inspectedWindow.reload({});
    setResults(initialResults);
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
    <>
      {/* <Modal isOpen={true} onClose={() => {}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loading...</ModalHeader>
        </ModalContent>
      </Modal> */}
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
            results={results.errors}
          />
          {/* <Section title="Warnings" status="warning" messages={warnings} /> */}
          <Section
            status="info"
            progress={issuesFixedProgress}
            results={results.fixes}
          />
          <Section
            status="success"
            progress={testsPassedProgress}
            results={results.passes}
          />
        </Flex>
      </Box>
    </>
  );
}

function Section({
  results,
  status,
  progress,
}: {
  results: Result[];
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
          {results.map((result, index) => (
            <Message
              key={index}
              index={index}
              result={result}
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
  success: 'passes',
  info: 'fixes',
};

function Message({
  result,
  status,
  index,
}: {
  result: Result;
  index: number;
  status: AlertStatus;
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <Alert cursor="pointer" onClick={() => setOpen(!isOpen)} status={status}>
        <AlertIcon />
        <AlertDescription>
          <Text fontWeight="600">{result.name}</Text>
          {result.message}
        </AlertDescription>
      </Alert>
      <AnimatePresence initial={false}>
        {isOpen &&
          result.nodeIdentifiers.map((node, nodeIndex) => (
            <motion.div
              key={`${node}-${nodeIndex}`}
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
                  onClick={() => {
                    chrome.devtools.inspectedWindow.eval(
                      // pageScript adds nodes to window
                      // (inspect(window.__A11Y_EXTENSION__.state.errors[0].nodes[0]))
                      `(inspect(window.__A11Y_EXTENSION__.state.${statusToProperty[status]}[${index}].nodes[${nodeIndex}]))`
                    );
                  }}
                >
                  {node}
                </Text>
              </Box>
            </motion.div>
          ))}
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
