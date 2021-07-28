import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Spacer,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextImage from 'next/image';
import React from 'react';
import coverImg from '../public/cover.jpg';

export default function Home() {
  return (
    <Flex minH="100vh" flexDirection="column">
      <Head>
        <title>a11y</title>
      </Head>
      <Header />
      <Flex
        flex={1}
        justifyContent="center"
        alignItems="center"
        position="relative"
        overflow="hidden"
      >
        <Image
          src="/triangle-light.svg"
          alt=""
          position="absolute"
          width="40%"
          top={0}
          right={0}
          zIndex={-1}
        />
        <SimpleGrid
          width={{ base: '85%', sm: '80%' }}
          mx="auto"
          height="full"
          alignContent="center"
          gap={4}
          columns={{ base: 1, sm: 1, md: 2 }}
        >
          <Flex
            height="full"
            width="90%"
            flexDir="column"
            justifyContent="center"
          >
            <Heading fontSize="3rem">a11y</Heading>
            <Text fontSize="1.6rem" mt={6}>
              The first accessibility testing engine which doesn&apos;t make the
              users compromise because of the issues made by developers
            </Text>
            <Button
              as="a"
              size="lg"
              width="fit-content"
              mt={6}
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Mokshit06/a11y-tech-syndicate#readme"
            >
              Get Started
            </Button>
          </Flex>
          <Box height="full" width="full">
            <NextImage
              alt=""
              height={1400}
              src={coverImg}
              className="object-fit"
            />
          </Box>
        </SimpleGrid>
      </Flex>
    </Flex>
  );
}

function Header() {
  return (
    <Flex
      as="nav"
      align="center"
      wrap="wrap"
      padding="1.3rem"
      zIndex={1000}
      boxShadow="md"
    >
      <Flex align="center" mr={5}>
        <Heading mb={{ base: 3, sm: 0 }} as="h1" size="lg">
          a11y
        </Heading>
      </Flex>

      <Spacer />

      <HStack
        spacing={5}
        mr={5}
        width={{ md: 'auto', base: 'full' }}
        alignItems="center"
      >
        <Link href="#">Download</Link>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Mokshit06/a11y-tech-syndicate"
        >
          Github
        </Link>
      </HStack>
    </Flex>
  );
}
