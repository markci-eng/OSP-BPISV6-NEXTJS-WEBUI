"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Fingerprint,
  Check,
  X,
  ArrowLeft,
  Phone,
  UserCircle,
  Wallet,
} from "lucide-react";
import logoIcon from "@/public/images/logo/icon.png";

const ease = [0.25, 0.1, 0.25, 1] as const;
const DEFAULT_PASSWORD = "123456";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease },
  };
}

const FEATURES = [
  "Retrieval Requests",
  "Room Reservations",
  "Fleet Management",
  "Trip Tickets",
  "Contracting",
];

const EXTERNAL_LINKS = [
  {
    id: "contact",
    label: "Contact Us",
    url: "https://online.stpeter.com.ph/Home/ContactUs",
    icon: Phone,
  },
  {
    id: "login",
    label: "Planholder Portal",
    url: "https://online.stpeter.com.ph/Login/LogInAccount",
    icon: UserCircle,
  },
  {
    id: "paybill",
    label: "Pay My Plan",
    url: "https://online.stpeter.com.ph/Paybill/Index",
    icon: Wallet,
  },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [stage, setStage] = useState<"welcome" | "password" | "signup">(
    "welcome"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("joycemb@stpeter.com.ph");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});
  const [bioStep, setBioStep] = useState<"idle" | "scanning" | "success">(
    "idle"
  );
  const [externalLink, setExternalLink] = useState<
    (typeof EXTERNAL_LINKS)[number] | null
  >(null);

  const completeLogin = async (passwordOverride?: string) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: passwordOverride ?? password }),
    });

    router.refresh();
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    await new Promise((r) => setTimeout(r, 1200));
    completeLogin(DEFAULT_PASSWORD);
  };

  const handleBiometricLogin = async () => {
    setSocialLoading("biometric");
    setBioStep("scanning");
    await new Promise((r) => setTimeout(r, 1800));
    setBioStep("success");
    await new Promise((r) => setTimeout(r, 1100));
    completeLogin(DEFAULT_PASSWORD);
  };

  const cancelBiometricLogin = () => {
    setBioStep("idle");
    setSocialLoading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    completeLogin();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSignupLoading(false);
    setEmail(signupEmail);
    setPassword("");
    setStage("password");
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
        className="lg:flex lg:w-[52%]">
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
          }}>
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

          <VStack
            position="relative"
            zIndex={10}
            gap={8}
            textAlign="center"
            px={16}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}>
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
                boxShadow="2xl">
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
              transition={{ delay: 0.2, duration: 0.5, ease }}>
              <VStack gap={3}>
                <Heading
                  as="h1"
                  fontSize="4xl"
                  fontWeight="bold"
                  color="white"
                  letterSpacing="tight"
                  lineHeight="tight">
                  One St. Peter
                </Heading>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="#6ee7b7"
                  letterSpacing="0.2em"
                  textTransform="uppercase">
                  Chapel Operations
                </Text>
                <Box h="1px" w="4rem" bg="rgba(16,185,129,0.6)" my={1} />
                <Text
                  fontSize="sm"
                  color="rgba(236,253,245,0.7)"
                  lineHeight="tall"
                  maxW="xs">
                  Manage chapel operations, reservations, fleet dispatch, and
                  service records — all in one place.
                </Text>
              </VStack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease }}>
              <Flex flexWrap="wrap" justifyContent="center" gap={2}>
                {FEATURES.map((f) => (
                  <Box
                    key={f}
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="medium"
                    color="#a7f3d0"
                    bg="rgba(6,78,59,0.5)"
                    borderWidth="1px"
                    borderColor="rgba(6,95,70,0.4)"
                    backdropFilter="blur(4px)">
                    {f}
                  </Box>
                ))}
              </Flex>
            </motion.div>
          </VStack>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            style={{ position: "absolute", bottom: "2rem" }}>
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
        justifyContent={{ base: "flex-start", lg: "center" }}
        pt={{ base: 10, lg: 0 }}
        px={{ base: 4, sm: 12, lg: 16 }}
        position="relative">
        <Box
          display={{ base: "block", lg: "none" }}
          position="absolute"
          inset={0}
          style={{
            background:
              "linear-gradient(170deg, #022c22 0%, #064e3b 35%, #f0fdf4 60%, #ffffff 100%)",
          }}
        />

        <motion.div {...fadeUp(0)}>
          <VStack
            display={{ base: "flex", lg: "none" }}
            position="relative"
            zIndex={10}
            mt={0}
            mb={5}
            gap={1}>
            <Flex
              w="6rem"
              h="6rem"
              rounded="2xl"
              bg="rgba(255,255,255,0.15)"
              backdropFilter="blur(8px)"
              borderWidth="1px"
              borderColor="rgba(255,255,255,0.25)"
              alignItems="center"
              justifyContent="center"
              boxShadow="xl"
              mb={3}>
              <Image
                src={logoIcon.src}
                alt="St. Peter Logo"
                width={68}
                height={68}
                style={{ objectFit: "contain" }}
                priority
              />
            </Flex>
            <Heading as="h1" fontSize="2xl" fontWeight="bold" color="white">
              One St. Peter
            </Heading>
            {/* <Text
              fontSize="xs"
              color="#6ee7b7"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Chapel Operations
            </Text> */}
          </VStack>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "28rem",
          }}>
          <Box
            bg="white"
            rounded="3xl"
            boxShadow="2xl"
            p={{ base: 6, sm: 10 }}
            borderWidth="1px"
            borderColor="rgba(243,244,246,0.8)">
            <AnimatePresence mode="wait">
              {stage === "welcome" ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease }}>
                  <VStack gap={6} textAlign="center">
                    <Box>
                      <Heading
                        as="h2"
                        fontSize="2xl"
                        fontWeight="bold"
                        color="gray.900">
                        Quick Sign In
                      </Heading>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Choose how you&apos;d like to continue
                      </Text>
                    </Box>

                    <VStack gap={3}>
                      <motion.button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={!!socialLoading}
                        whileHover={socialLoading ? {} : { scale: 1.04 }}
                        whileTap={socialLoading ? {} : { scale: 0.94 }}
                        aria-label="Log in with biometrics"
                        style={{
                          width: "128px",
                          height: "128px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "9999px",
                          border: "none",
                          outline: "none",
                          background:
                            "radial-gradient(circle, rgba(5,150,105,0.1) 0%, rgba(5,150,105,0.03) 70%, transparent 100%)",
                          cursor: socialLoading ? "not-allowed" : "pointer",
                          opacity:
                            socialLoading && socialLoading !== "biometric"
                              ? 0.45
                              : 1,
                          transition: "transform 0.15s",
                        }}>
                        {socialLoading === "biometric" ? (
                          <Loader2
                            size={52}
                            style={{
                              animation: "spin 1s linear infinite",
                              color: "#059669",
                            }}
                          />
                        ) : (
                          <Fingerprint size={60} color="#059669" />
                        )}
                      </motion.button>

                      <Text
                        onClick={() => setStage("password")}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.500"
                        cursor="pointer"
                        _hover={{ color: "green.700" }}>
                        {socialLoading === "biometric"
                          ? "Verifying biometrics…"
                          : "Use password instead"}
                      </Text>
                    </VStack>

                    <HStack w="full">
                      <Separator flex="1" borderColor="gray.100" />
                      <Text
                        fontSize="10px"
                        letterSpacing="widest"
                        color="gray.400"
                        fontWeight="semibold"
                        textTransform="uppercase">
                        Continue with
                      </Text>
                      <Separator flex="1" borderColor="gray.100" />
                    </HStack>

                    <VStack gap={2} w="full">
                      {[
                        {
                          id: "google",
                          providerLabel: "Google",
                          providerLogo:
                            "/images/osp-chakra-reusable-components/icons8-google-48.png",
                          greeting: "Sign in as Joyce Basilio-Ramos",
                          email: "joycemb@stpeter.com.ph",
                          avatar:
                            "https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no",
                        },
                        {
                          id: "facebook",
                          providerLabel: "Facebook",
                          providerLogo:
                            "/images/osp-chakra-reusable-components/icons8-meta-48.png",
                          greeting: "Continue as Joyce Basilio-Ramos",
                          email: "joycemb@stpeter.com.ph",
                          avatar:
                            "https://scontent-lga3-1.xx.fbcdn.net/v/t39.30808-1/240453222_10158707145232013_2332180473992613988_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2048x2047&ctp=s40x40&_nc_cat=103&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHbsC6uUB2zqxwO0D3gQGDTwCRz7JlBua_AJHPsmUG5r8neQQIF246QJK5Y88UgZClRdJbSkwKr4xLuOivENtGy&_nc_ohc=OBD3e6D1LTIQ7kNvwErQCkB&_nc_oc=Adryocwxy5KqGIreaqIXnyBmCQPhyCDdUv_cLHdwMMe0W8vgi8X0ikg57mfW83MkGMc&_nc_zt=24&_nc_ht=scontent-lga3-1.xx&_nc_gid=lDlUlZl5nGVF4-xhbFFGVg&_nc_ss=792a8&oh=00_AQCT8rtpTEpNDV7OXduiD439xzln6JDxPldLiEt1z83CNg&oe=6A529496",
                        },
                      ].map((p) => (
                        <motion.button
                          key={p.id}
                          type="button"
                          onClick={() => handleSocialLogin(p.id)}
                          disabled={!!socialLoading}
                          whileHover={socialLoading ? {} : { y: -1 }}
                          whileTap={socialLoading ? {} : { scale: 0.985 }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            border: "1.5px solid #e5e7eb",
                            background: "white",
                            cursor: socialLoading ? "not-allowed" : "pointer",
                            opacity:
                              socialLoading && socialLoading !== p.id
                                ? 0.45
                                : 1,
                            transition:
                              "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                          onMouseEnter={(e) => {
                            if (socialLoading) return;
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "#f8fafc";
                            el.style.borderColor = "#cbd5e1";
                            el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "white";
                            el.style.borderColor = "#e5e7eb";
                            el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                          }}>
                          <Flex
                            position="relative"
                            w="30px"
                            h="30px"
                            flexShrink={0}
                            rounded="full"
                            overflow="hidden"
                            bg="linear-gradient(135deg, #059669 0%, #065f46 100%)"
                            color="white"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="semibold">
                            {avatarErrors[p.id] ? (
                              "JB"
                            ) : (
                              <Image
                                src={p.avatar}
                                alt="Joyce Basilio-Ramos"
                                width={30}
                                height={30}
                                style={{ objectFit: "cover" }}
                                onError={() =>
                                  setAvatarErrors((prev) => ({
                                    ...prev,
                                    [p.id]: true,
                                  }))
                                }
                              />
                            )}
                          </Flex>

                          <VStack
                            flex={1}
                            gap={0}
                            alignItems="flex-start"
                            minW={0}
                            w="full">
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.800"
                              w="full"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap">
                              {p.greeting}
                            </Text>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              w="full"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap">
                              {p.email}
                            </Text>
                          </VStack>

                          <Image
                            src={p.providerLogo}
                            alt={p.providerLabel}
                            width={18}
                            height={18}
                            style={{ objectFit: "contain", flexShrink: 0 }}
                          />

                          {socialLoading === p.id ? (
                            <Loader2
                              size={18}
                              style={{
                                animation: "spin 1s linear infinite",
                                color: "#6b7280",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <ArrowRight
                              size={16}
                              color="#9ca3af"
                              style={{ flexShrink: 0 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </VStack>

                    <Link
                      onClick={() => setStage("signup")}
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.500"
                      cursor="pointer"
                      _hover={{ color: "green.700" }}>
                      No Account? Sign up.
                    </Link>
                  </VStack>
                </motion.div>
              ) : stage === "signup" ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease }}>
                  <motion.button
                    type="button"
                    onClick={() => setStage("welcome")}
                    whileHover={{ x: -2 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}>
                    <ArrowLeft size={14} color="#6b7280" />
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                      Back
                    </Text>
                  </motion.button>

                  <Box mb={8}>
                    <Heading
                      as="h2"
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.900">
                      Create your account
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Sign up to get started
                    </Text>
                  </Box>

                  <form onSubmit={handleSignup}>
                    <VStack gap={5}>
                      <Box w="full">
                        <Field.Root>
                          <Field.Label
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700">
                            Full name
                          </Field.Label>
                          <Input
                            type="text"
                            required
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="Juan Dela Cruz"
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
                        </Field.Root>
                      </Box>

                      <Box w="full">
                        <Field.Root>
                          <Field.Label
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700">
                            Email address
                          </Field.Label>
                          <InputGroup
                            width="full"
                            startElement={
                              <Box color="gray.400">
                                <Mail size={16} />
                              </Box>
                            }>
                            <Input
                              type="email"
                              required
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
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
                      </Box>

                      <Box w="full">
                        <Field.Root>
                          <Field.Label
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700">
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
                                onClick={() =>
                                  setShowSignupPassword((v) => !v)
                                }
                                aria-label={
                                  showSignupPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                color="gray.400"
                                _hover={{ color: "gray.600" }}>
                                {showSignupPassword ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </IconButton>
                            }
                            endElementProps={{ pointerEvents: "auto" }}>
                            <Input
                              type={showSignupPassword ? "text" : "password"}
                              required
                              value={signupPassword}
                              onChange={(e) =>
                                setSignupPassword(e.target.value)
                              }
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
                      </Box>

                      <motion.div
                        style={{ width: "100%" }}
                        whileHover={{ scale: signupLoading ? 1 : 1.015 }}
                        whileTap={{ scale: signupLoading ? 1 : 0.985 }}>
                        <Button
                          type="submit"
                          width="full"
                          loading={signupLoading}
                          loadingText="Creating account…"
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
                          _active={{}}>
                          Create Account
                          <ArrowRight size={16} />
                        </Button>
                      </motion.div>
                    </VStack>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease }}>
                  <motion.button
                    type="button"
                    onClick={() => setStage("welcome")}
                    whileHover={{ x: -2 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}>
                    <ArrowLeft size={14} color="#6b7280" />
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                      Back
                    </Text>
                  </motion.button>

                  <Box mb={8}>
                    <Heading
                      as="h2"
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.900">
                      Welcome back
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Sign in to your account to continue
                    </Text>
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <VStack gap={5}>
                      <Box w="full">
                        <Field.Root>
                          <Field.Label
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700">
                            Email address
                          </Field.Label>
                          <InputGroup
                            width="full"
                            startElement={
                              <Box color="gray.400">
                                <Mail size={16} />
                              </Box>
                            }>
                            <Input
                              type="email"
                              required
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
                      </Box>

                      <Box w="full">
                        <Field.Root>
                          <Field.Label
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700">
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
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                color="gray.400"
                                _hover={{ color: "gray.600" }}>
                                {showPassword ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </IconButton>
                            }
                            endElementProps={{ pointerEvents: "auto" }}>
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
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
                      </Box>

                      <Box w="full">
                        <HStack justifyContent="space-between">
                          <Checkbox.Root
                            colorPalette="green"
                            checked={remember}
                            onCheckedChange={(e) =>
                              setRemember(!!e.checked)
                            }
                            cursor="pointer">
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
                            _hover={{ color: "green.600" }}>
                            Forgot password?
                          </Link>
                        </HStack>
                      </Box>

                      <motion.div
                        style={{ width: "100%" }}
                        whileHover={{ scale: loading ? 1 : 1.015 }}
                        whileTap={{ scale: loading ? 1 : 0.985 }}>
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
                          _active={{}}>
                          Sign in
                          <ArrowRight size={16} />
                        </Button>
                      </motion.div>
                    </VStack>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* <motion.div {...fadeUp(0.58)}>
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
        </motion.div>

        <motion.div
          {...fadeUp(0.25)}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "28rem",
            marginTop: "24px",
            marginBottom: "16px",
          }}>
          <HStack justifyContent="center" gap={{ base: 7, sm: 10 }}>
            {EXTERNAL_LINKS.map((link) => (
              <motion.button
                key={link.id}
                type="button"
                onClick={() => setExternalLink(link)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                aria-label={link.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}>
                <Flex
                  w="48px"
                  h="48px"
                  rounded="full"
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                  color="green.700">
                  <link.icon size={20} />
                </Flex>
                <Text fontSize="xs" fontWeight="medium" color="gray.600">
                  {link.label}
                </Text>
              </motion.button>
            ))}
          </HStack>
        </motion.div>
      </Flex>

      <AnimatePresence>
        {externalLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,44,34,0.55)",
              backdropFilter: "blur(4px)",
              padding: "16px",
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22, ease }}
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "min(85vh, 720px)",
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                px={5}
                py={4}
                borderBottomWidth="1px"
                borderColor="gray.100"
                flexShrink={0}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {externalLink.label}
                </Text>
                <IconButton
                  variant="ghost"
                  size="xs"
                  onClick={() => setExternalLink(null)}
                  aria-label="Close"
                  color="gray.400"
                  _hover={{ color: "gray.600" }}>
                  <X size={16} />
                </IconButton>
              </Flex>
              <Box flex={1} minH={0}>
                <iframe
                  src={externalLink.url}
                  title={externalLink.label}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bioStep !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,44,34,0.55)",
              backdropFilter: "blur(4px)",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease }}
              style={{
                width: "100%",
                maxWidth: "22rem",
                background: "white",
                borderRadius: "24px",
                padding: "32px 28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                textAlign: "center",
              }}
            >
              <Flex
                position="relative"
                w="88px"
                h="88px"
                mx="auto"
                mb={5}
                alignItems="center"
                justifyContent="center"
              >
                {bioStep === "scanning" && (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "9999px",
                      border: "2px solid #059669",
                    }}
                  />
                )}
                <Flex
                  w="72px"
                  h="72px"
                  rounded="full"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    background:
                      bioStep === "success"
                        ? "linear-gradient(135deg, #059669 0%, #065f46 100%)"
                        : "linear-gradient(135deg, #059669 0%, #065f46 100%)",
                    boxShadow: "0 8px 24px rgba(5,150,105,0.35)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {bioStep === "success" ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        }}
                      >
                        <Check size={32} color="white" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="scan"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        <Fingerprint size={32} color="white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Flex>
              </Flex>

              <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={1}>
                {bioStep === "success" ? "Verified" : "Scanning biometrics…"}
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={bioStep === "success" ? 0 : 5}>
                {bioStep === "success"
                  ? "Welcome back, Joyce Basilio-Ramos"
                  : "Hold still while we confirm it's you"}
              </Text>

              {bioStep === "scanning" && (
                <motion.button
                  type="button"
                  onClick={cancelBiometricLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    margin: "0 auto",
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} color="#6b7280" />
                  <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                    Cancel
                  </Text>
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
}
