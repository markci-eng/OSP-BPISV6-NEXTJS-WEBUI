"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Button,
  Checkbox,
  Field,
  Separator,
  Link,
  IconButton,
  InputGroup,
} from "@chakra-ui/react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import logoIcon from "@/public/images/logo/icon.png";

const ease = [0.25, 0.1, 0.25, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease },
  };
}

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    await new Promise((r) => setTimeout(r, 1200));
    setSocialLoading(null);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   await new Promise((r) => setTimeout(r, 1000));
  //   router.replace("/");
  // };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("emailInput");
    const password = form.get("passwordInput");
    if (typeof email === "string" && typeof password === "string")
      onLogin(email, password);
  };

  return (
    <Flex minH="100vh" bg="white" overflow="hidden">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* ── Left brand panel (desktop only) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        style={{ display: "none" }}
        className="lg:flex lg:w-[52%]"
      >
        <Box
          display={{ base: "none", lg: "flex" }}
          w="52%"
          position="relative"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          flexShrink={0}
          style={{
            background:
              "linear-gradient(145deg, #022c22 0%, #064e3b 40%, #065f46 70%, #047857 100%)",
          }}
        >
          {/* decorative rings */}
          <Box
            position="absolute"
            top="-8rem"
            left="-8rem"
            w="28rem"
            h="28rem"
            rounded="full"
            borderWidth="1px"
            borderColor="rgba(6,95,70,0.3)"
          />
          <Box
            position="absolute"
            top="-5rem"
            left="-5rem"
            w="20rem"
            h="20rem"
            rounded="full"
            borderWidth="1px"
            borderColor="rgba(16,185,129,0.15)"
          />
          <Box
            position="absolute"
            bottom="-10rem"
            right="-10rem"
            w="36rem"
            h="36rem"
            rounded="full"
            borderWidth="1px"
            borderColor="rgba(6,95,70,0.2)"
          />
          <Box
            position="absolute"
            bottom="2.5rem"
            right="2.5rem"
            w="18rem"
            h="18rem"
            rounded="full"
            borderWidth="1px"
            borderColor="rgba(16,185,129,0.12)"
          />

          {/* dot grid */}
          <Box
            position="absolute"
            inset={0}
            opacity={0.1}
            style={{
              backgroundImage:
                "radial-gradient(circle, #6ee7b7 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* glow orb */}
          <Box
            position="absolute"
            top="25%"
            left="50%"
            w="20rem"
            h="20rem"
            rounded="full"
            pointerEvents="none"
            style={{
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
            }}
          />

          {/* brand content */}
          <VStack
            position="relative"
            zIndex={10}
            gap={8}
            textAlign="center"
            px={16}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Flex
                w="7rem"
                h="7rem"
                rounded="3xl"
                bg="rgba(255,255,255,0.1)"
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor="rgba(255,255,255,0.2)"
                alignItems="center"
                justifyContent="center"
                boxShadow="2xl"
              >
                <Image
                  src={logoIcon.src}
                  alt="St. Peter Logo"
                  width={84}
                  height={84}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Flex>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease }}
            >
              <VStack gap={3}>
                <Heading
                  as="h1"
                  fontSize="4xl"
                  fontWeight="bold"
                  color="white"
                  letterSpacing="tight"
                  lineHeight="tight"
                >
                  One St. Peter
                </Heading>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="#6ee7b7"
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                >
                  Life Plan Operations
                </Text>
                <Box h="1px" w="4rem" bg="rgba(16,185,129,0.6)" my={1} />
                <Text
                  fontSize="sm"
                  color="rgba(236,253,245,0.7)"
                  lineHeight="tall"
                  maxW="xs"
                >
                  Manage life plan operations, reservations, fleet dispatch, and
                  service records — all in one place.
                </Text>
              </VStack>
            </motion.div>
          </VStack>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            style={{ position: "absolute", bottom: "2rem" }}
          >
            <Text fontSize="xs" color="rgba(6,95,70,0.8)">
              © 2026 St. Peter Memorial Chapels. All rights reserved.
            </Text>
          </motion.div>
        </Box>
      </motion.div>

      {/* ── Right form panel ── */}
      <Flex
        flex={1}
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        px={{ base: 6, sm: 12, lg: 16 }}
        position="relative"
      >
        {/* mobile gradient */}
        <Box
          display={{ base: "block", lg: "none" }}
          position="absolute"
          inset={0}
          style={{
            background:
              "linear-gradient(170deg, #022c22 0%, #064e3b 35%, #f0fdf4 60%, #ffffff 100%)",
          }}
        />

        {/* mobile logo */}
        <motion.div {...fadeUp(0)}>
          <VStack
            display={{ base: "flex", lg: "none" }}
            position="relative"
            zIndex={10}
            mb={8}
            gap={1}
          >
            <Flex
              w="5rem"
              h="5rem"
              rounded="2xl"
              bg="rgba(255,255,255,0.15)"
              backdropFilter="blur(8px)"
              borderWidth="1px"
              borderColor="rgba(255,255,255,0.25)"
              alignItems="center"
              justifyContent="center"
              boxShadow="xl"
              mb={3}
            >
              <Image
                src={logoIcon.src}
                alt="St. Peter Logo"
                width={56}
                height={56}
                style={{ objectFit: "contain" }}
                priority
              />
            </Flex>
            <Heading as="h1" fontSize="2xl" fontWeight="bold" color="white">
              One St. Peter
            </Heading>
            <Text
              fontSize="xs"
              color="#6ee7b7"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Life Plan Operations
            </Text>
          </VStack>
        </motion.div>

        {/* form card */}
        <motion.div
          {...fadeUp(0.1)}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "28rem",
          }}
        >
          <Box
            bg="white"
            rounded="3xl"
            boxShadow="2xl"
            p={{ base: 8, sm: 10 }}
            borderWidth="1px"
            borderColor="rgba(243,244,246,0.8)"
          >
            {/* card header */}
            <motion.div {...fadeUp(0.18)}>
              <Box mb={8}>
                <Heading
                  as="h2"
                  fontSize="2xl"
                  fontWeight="bold"
                  color="gray.900"
                >
                  Welcome back
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Sign in to your account to continue
                </Text>
              </Box>
            </motion.div>

            <form onSubmit={handleSubmit}>
              <VStack gap={5}>
                {/* email */}
                <motion.div {...fadeUp(0.24)} style={{ width: "100%" }}>
                  <Field.Root>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Email address
                    </Field.Label>
                    <InputGroup
                      width="full"
                      startElement={
                        <Box color="gray.400">
                          <Mail size={16} />
                        </Box>
                      }
                    >
                      <Input
                        type="email"
                        required
                        name="emailInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@stpeter.com.ph"
                        bg="gray.50"
                        borderColor="gray.200"
                        rounded="xl"
                        fontSize="sm"
                        _focus={{
                          borderColor: "green.500",
                          bg: "white",
                          boxShadow: "0 0 0 4px rgba(16,185,129,0.1)",
                        }}
                      />
                    </InputGroup>
                  </Field.Root>
                </motion.div>

                {/* password */}
                <motion.div {...fadeUp(0.3)} style={{ width: "100%" }}>
                  <Field.Root>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Password
                    </Field.Label>
                    <InputGroup
                      width="full"
                      startElement={
                        <Box color="gray.400">
                          <Lock size={16} />
                        </Box>
                      }
                      endElement={
                        <IconButton
                          variant="ghost"
                          size="xs"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          color="gray.400"
                          _hover={{ color: "gray.600" }}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </IconButton>
                      }
                      endElementProps={{ pointerEvents: "auto" }}
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        name="passwordInput"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        bg="gray.50"
                        borderColor="gray.200"
                        rounded="xl"
                        fontSize="sm"
                        _focus={{
                          borderColor: "green.500",
                          bg: "white",
                          boxShadow: "0 0 0 4px rgba(16,185,129,0.1)",
                        }}
                      />
                    </InputGroup>
                  </Field.Root>
                </motion.div>

                {/* remember me + forgot password */}
                <motion.div {...fadeUp(0.36)} style={{ width: "100%" }}>
                  <HStack justifyContent="space-between">
                    <Checkbox.Root
                      colorPalette="green"
                      checked={remember}
                      onCheckedChange={(e) => setRemember(!!e.checked)}
                      cursor="pointer"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control rounded="sm" />
                      <Checkbox.Label fontSize="sm" color="gray.600">
                        Remember me
                      </Checkbox.Label>
                    </Checkbox.Root>
                    <Link
                      href="#"
                      fontSize="sm"
                      fontWeight="medium"
                      color="green.700"
                      _hover={{ color: "green.600" }}
                    >
                      Forgot password?
                    </Link>
                  </HStack>
                </motion.div>

                {/* submit */}
                <motion.div
                  {...fadeUp(0.42)}
                  style={{ width: "100%" }}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                >
                  <Button
                    type="submit"
                    width="full"
                    loading={loading}
                    loadingText="Signing in…"
                    rounded="xl"
                    py={6}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="white"
                    style={{
                      background:
                        "linear-gradient(135deg, #059669 0%, #065f46 100%)",
                      boxShadow: "0 4px 22px rgba(5,150,105,0.35)",
                    }}
                    _hover={{}}
                    _active={{}}
                  >
                    Sign in
                    <ArrowRight size={16} />
                  </Button>
                </motion.div>
              </VStack>
            </form>

            {/* divider */}
            <motion.div {...fadeUp(0.48)}>
              <HStack my={6}>
                <Separator flex="1" borderColor="gray.100" />
                <Text
                  fontSize="10px"
                  letterSpacing="widest"
                  color="gray.400"
                  fontWeight="semibold"
                  textTransform="uppercase"
                >
                  Or continue with
                </Text>
                <Separator flex="1" borderColor="gray.100" />
              </HStack>
            </motion.div>

            {/* social login buttons */}
            <motion.div {...fadeUp(0.52)}>
              <HStack gap={3}>
                {[
                  {
                    id: "google",
                    label: "Google",
                    src: "/images/osp-chakra-reusable-components/icons8-google-48.png",
                    hoverBg: "#fff8f8",
                    hoverBorder: "#fca5a5",
                  },
                  {
                    id: "facebook",
                    label: "Facebook",
                    src: "/images/osp-chakra-reusable-components/icons8-meta-48.png",
                    hoverBg: "#f0f4ff",
                    hoverBorder: "#93c5fd",
                  },
                ].map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => handleSocialLogin(p.id)}
                    disabled={!!socialLoading}
                    whileHover={socialLoading ? {} : { y: -2 }}
                    whileTap={socialLoading ? {} : { scale: 0.96 }}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "12px 8px",
                      borderRadius: "14px",
                      border: "1.5px solid #f0f0f0",
                      background: "white",
                      cursor: socialLoading ? "not-allowed" : "pointer",
                      opacity:
                        socialLoading && socialLoading !== p.id ? 0.45 : 1,
                      transition:
                        "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      if (socialLoading) return;
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = p.hoverBg;
                      el.style.borderColor = p.hoverBorder;
                      el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "white";
                      el.style.borderColor = "#f0f0f0";
                      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                    }}
                  >
                    {socialLoading === p.id ? (
                      <Loader2
                        size={20}
                        style={{
                          animation: "spin 1s linear infinite",
                          color: "#6b7280",
                        }}
                      />
                    ) : (
                      <Image
                        src={p.src}
                        alt={p.label}
                        width={22}
                        height={22}
                        style={{ objectFit: "contain" }}
                      />
                    )}
                    <Text
                      fontSize="11px"
                      fontWeight="semibold"
                      color="gray.500"
                    >
                      {p.label}
                    </Text>
                  </motion.button>
                ))}
              </HStack>
            </motion.div>

            {/* footer note
            <motion.div {...fadeUp(0.58)}>
              <Text
                textAlign="center"
                fontSize="xs"
                color="gray.400"
                lineHeight="tall"
                mt={5}
              >
                This system is for authorized St. Peter personnel only.
                <br />
                Unauthorized access is prohibited.
              </Text>
            </motion.div> */}
          </Box>

          <motion.div {...fadeUp(0.56)}>
            <Text textAlign="center" fontSize="xs" color="gray.400" mt={5}>
              © 2026 St. Peter Life Plans
            </Text>
          </motion.div>
        </motion.div>
      </Flex>
    </Flex>
  );
}
