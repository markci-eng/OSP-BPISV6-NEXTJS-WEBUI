"use client";
import {
  Box,
  Flex,
  Text,
  Link,
  Image,
  VStack,
  HStack,
  Button,
  Strong,
  Heading,
  Checkbox,
  useBreakpointValue,
  Separator,
  Grid,
} from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputFloatingLabel,
  Body,
  H4,
  Small,
  LoginFlexButton,
  PrimaryMdFlexButton,
} from "st-peter-ui";
import imgMetaLogo from "@/public/images/osp-chakra-reusable-components/icons8-meta-48.png";
import imgStPeterLogo from "@/public/images/osp-chakra-reusable-components/stpeter-logo.png";
import imgAppleLogo from "@/public/images/osp-chakra-reusable-components/icons8-apple-48.png";
import imgGoogleLogo from "@/public/images/osp-chakra-reusable-components/icons8-google-48.png";
import imgTwitterLogo from "@/public/images/osp-chakra-reusable-components/icons8-x-48.png";
import imgBackground from "@/public/images/hoabout.jpg";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    middlename: string,
    contactnumber: string,
  ) => void;
  forgotPasswordLink?: string;
}

const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

export function LoginPage({
  onLogin,
  onSignUp,
  forgotPasswordLink,
}: LoginPageProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUpClick = () => setIsSignUp(true);
  const handleSignInClick = () => setIsSignUp(false);

  const Login_OnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("emailInput");
    const password = form.get("passwordInput");
    if (typeof email === "string" && typeof password === "string")
      onLogin(email, password);
  };

  const Signup_OnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("emailInput");
    const password = form.get("passwordInput");
    const firstname = form.get("firstnameInput");
    const lastname = form.get("lastnameInput");
    const middlename = form.get("middlenameInput");
    const contactnumber = form.get("contactInput");
    const confirm = form.get("confirmPasswordInput");
    if (password !== confirm) return alert("Passwords do not match");
    if (
      typeof email === "string" &&
      typeof password === "string" &&
      typeof firstname === "string" &&
      typeof lastname === "string" &&
      typeof middlename === "string" &&
      typeof contactnumber === "string"
    )
      onSignUp(email, password, firstname, lastname, middlename, contactnumber);
  };

  return (
    <Flex
      w="100%"
      h="100vh"
      align="center"
      justify="center"
      backgroundImage={`url('${imgBackground.src}')`}
      backgroundSize={"cover"}
      backgroundPosition={"center"}
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bg: "blackAlpha.800", // overlay color
        zIndex: 0,
      }}
    >
      <Flex
        position="relative"
        // left={{
        //   base: 0,
        //   md: "calc(50% - 450px)",
        // }}
        w={{ base: "100%", md: isSignUp ? "650px" : "450px" }}
        h={{ base: "100%", md: "650px" }}
        borderRadius={{ base: 0, md: "lg" }}
        boxShadow="xl"
        bg="white"
        overflow="hidden"
        transition={"width 0.4s ease" /* smooth width transition on toggle */}
      >
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <MotionFlex
              key="signin"
              flex="1"
              align="center"
              justify="center"
              p={8}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={Login_OnSubmit}>
                <VStack padding={4} align="stretch" minW="280px">
                  <Image
                    src={imgStPeterLogo.src}
                    w="100%"
                    mx="auto"
                    mb={isMobile ? "20px" : "10px"}
                  />
                  {/* <Heading
                    size="lg"
                    textAlign="center"
                    color={"rgb(53, 53, 53)"}
                    mb={isMobile ? "20px" : "10px"}
                  >
                    Log In
                  </Heading> */}
                  <center>
                    <H4>Log In</H4>
                  </center>
                  <InputFloatingLabel
                    type="email"
                    label="Email"
                    name="emailInput"
                    required
                    autoComplete="off"
                  />
                  <InputFloatingLabel
                    type="password"
                    label="Password"
                    name="passwordInput"
                    required
                    autoComplete="off"
                  />
                  <Link
                    href={forgotPasswordLink}
                    color="blue.500"
                    fontSize="sm"
                    my={"10px"}
                  >
                    Forgot your password?
                  </Link>
                  <LoginFlexButton type="submit" />

                  <HStack my={3}>
                    <Separator flex="1" />
                    <Text flexShrink="0"> or </Text>
                    <Separator flex="1" />
                  </HStack>

                  <HStack justify="space-between" gap={1}>
                    <Link
                      href="#"
                      border={"1px solid #ddd"}
                      borderRadius={"md"}
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      margin={0}
                      height={"40px"}
                      width={"full"}
                      _hover={{
                        border: "2px solid var(--chakra-colors-primary)",
                      }}
                    >
                      <Image src={imgGoogleLogo.src} boxSize="6" />
                    </Link>
                    <Link
                      href="#"
                      border={"1px solid #ddd"}
                      borderRadius={"md"}
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      margin={0}
                      height={"40px"}
                      width={"full"}
                      _hover={{
                        border: "2px solid var(--chakra-colors-primary)",
                      }}
                    >
                      <Image src={imgMetaLogo.src} boxSize="6" />
                    </Link>
                    {/* <Link
                      href='#'
                      border={"1px solid #ddd"}
                      borderRadius={"md"}
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      margin={0}
                      height={"40px"}
                      width={"full"}
                       _hover={{
                        border: "2px solid var(--chakra-colors-primary)"
                      }}
                      >
                        <Image src={imgAppleLogo} boxSize="6" />
                      </Link> */}
                    <Link
                      href="#"
                      border={"1px solid #ddd"}
                      borderRadius={"md"}
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      margin={0}
                      height={"40px"}
                      width={"full"}
                      _hover={{
                        border: "2px solid var(--chakra-colors-primary)",
                      }}
                    >
                      <Image src={imgTwitterLogo.src} boxSize="6" />
                    </Link>
                  </HStack>

                  <Text
                    fontSize="sm"
                    textAlign="center"
                    color="gray.500"
                    mt={2}
                    // position={"absolute"}
                    // left={0}
                    // right={0}
                    // bottom={"80px"}
                    // display={isMobile ? "block" : "none"}
                  >
                    Don’t have an account?{" "}
                    <Link
                      color={"var(--chakra-colors-primary)"}
                      onClick={handleSignUpClick}
                    >
                      <Strong> Create Account</Strong>
                    </Link>
                  </Text>
                </VStack>
              </form>
            </MotionFlex>
          ) : (
            <MotionFlex
              key="signup"
              flex="1"
              align="center"
              justify="center"
              p={0}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: isMobile ? 0 : 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={Signup_OnSubmit}>
                <VStack padding={3} align="stretch" maxW="md">
                  <H4 color={"rgb(53, 53, 53)"}>Create Account</H4>
                  <Body color="gray.600">Join us and secure your future.</Body>
                  <hr />

                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gapX={4}
                  >
                    <InputFloatingLabel
                      label="Last Name"
                      name="lastnameInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="First Name"
                      name="firstnameInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="Middle Name"
                      name="middlenameInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="Email"
                      type="email"
                      name="emailInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="Contact No."
                      type="number"
                      name="contactInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="Password"
                      type="password"
                      name="passwordInput"
                      required
                      autoComplete="off"
                    />
                    <InputFloatingLabel
                      label="Confirm Password"
                      type="password"
                      name="confirmPasswordInput"
                      required
                      autoComplete="off"
                    />
                  </Grid>

                  <Checkbox.Root mt={"10px"} colorPalette="theme">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label
                      color={"rgb(53, 53, 53)"}
                      {...({ children: null } as any)}
                    >
                      I agree to the{" "}
                      <Link color={"var(--chakra-colors-primary)"}>
                        <Strong>Terms and Conditions</Strong>
                      </Link>
                    </Checkbox.Label>
                  </Checkbox.Root>
                  <Checkbox.Root mb={"10px"} colorPalette="theme">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label
                      color={"rgb(53, 53, 53)"}
                      {...({ children: null } as any)}
                    >
                      I agree to the{" "}
                      <Link color={"var(--chakra-colors-primary)"}>
                        <Strong>Data Privacy Policy</Strong>
                      </Link>
                    </Checkbox.Label>
                  </Checkbox.Root>

                  <PrimaryMdFlexButton type="submit">
                    Sign Up
                  </PrimaryMdFlexButton>
                  {/* <SignupButton type="submit" width={"100%"}/> */}
                  <Text
                    fontSize="sm"
                    textAlign="center"
                    color="gray.500"
                    mt={2}
                    // position={"absolute"}
                    // left={0}
                    // right={0}
                    // bottom={"80px"}
                    // display={isMobile ? "block" : "none"}
                  >
                    Already have an account?{" "}
                    <Link
                      color={"var(--chakra-colors-primary)"}
                      onClick={handleSignInClick}
                    >
                      <Strong> Log In</Strong>
                    </Link>
                  </Text>
                </VStack>
              </form>
            </MotionFlex>
          )}
        </AnimatePresence>
      </Flex>
    </Flex>
  );
}
