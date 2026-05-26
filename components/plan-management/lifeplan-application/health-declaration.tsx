import React, { useState } from "react";
import {
  VStack,
  HStack,
  Box,
  Input,
  Heading,
  Accordion,
  Span,
  Stack,
  Checkbox,
  Separator,
} from "@chakra-ui/react";
import {
  Button,
  FileUpload,
  Icon,
  useFileUploadContext,
} from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import {
  Body,
  H3,
  H4,
  PrimaryMdButton,
  PrimarySmButton,
  SecondaryMdButton,
} from "st-peter-ui";
import { UploadFile } from "@splpi/operations";
const HealthDeclaration = () => {
  const [value, setValue] = useState(["second-item"]);
  const items = [
    {
      value: "first-item",
      title:
        "Authorization to Physician, Clinics, Hospitals, Pre-need plan and insurance companies",
      text: "ST. PETER LIFE PLAN, INC. is considering an application for coverage on my life and this serves as my authorization and request to the concerned doctor, physician or hospital, or any physician in its employ or connected/associated with it in any way, to give to ST. PETER LIFE PLAN, INC., or its authorized representative, any information which it/he may desire and which you have acquired in attending to me in a professional capacity. A photocopy of this authorization shall be as valid as the original. This authorization is in connection with my application for insurance coverage only.",
    },
    {
      value: "second-item",
      title: "Data Privacy",
      text: (
        <>
          By entering into and agreeing to this valid and binding electronic and
          digital Life Plan Contract, the Planholder effectively consents to the
          collection, processing, transmission, handling and storage by St.
          Peter Life Plan, Inc. (including any of its subsidiaries, affiliates
          or its authorized third parties), of his/her Personal Data in any form
          whatsoever, which is necessary for the purpose of administering and
          servicing the Planholder’s Life Plan, and also consents and agrees to
          and accepts the Company’s Data Privacy Policy, all in compliance with
          the Data Privacy Act.
          <br />
          <br />
          Please read the Company’s Data Privacy Policy at{" "}
          <a
            href="https://stpeter.com.ph/privacy-policy"
            target="_blank"
            className="text-blue-600 underline"
            rel="noopener noreferrer"
          >
            www.stpeter.com.ph/privacy-policy
          </a>
          .
        </>
      ),
    },
    {
      value: "third-item",
      title: "Online Purchase Authentication",
      text: (
        <>
          <Body className="text-start">
            I fully understand that in my purchase of the Life Plan product
            which I have chosen, I am required to upload a clear specimen of my
            current and valid government issued ID and three (3) specimens of my
            electronic signature in order to authenticate and verify my identity
            before I can click the “CONTINUE” button. I am solely responsible
            and accountable for any misrepresentation and all other consequences
            arising from my uploading of the specimen signatures of my valid ID
            and/or electronic signature.
          </Body>
          <Body>
            However, I fully understand that by clicking the “CONTINUE” button,
            for all intents and purposes, this ultimately means that I give my
            express, final, irrevocable and unconditional consent to
            electronically and digitally purchase the Life Plan product which I
            have chosen and finalize my application, and that I have expressly
            agreed to enter into a valid and binding electronic and digital
            contract with St. Peter Life Plan, Inc. and its Terms and
            Conditions, even if I do not upload my genuine valid ID and/or
            electronic signature. I also hereby agree to accept and comply with
            the applicable and currently prescribed electronic and digital
            payment methods in this platform.
          </Body>
          <Body>
            I understand that I am solely responsible for maintaining the
            confidentiality of my account and password and for restricting
            access to my account and I accept all responsibility for all
            activities that occur under my account and password.
          </Body>
        </>
      ),
    },
  ];

  return (
    <>
      <VStack align="stretch" gap={4} mb={4}>
        <H4>Health Declaration</H4>
        <Body>
          Please check all the boxes that apply to you and skip the boxes that
          do not apply.
        </Body>
        <Body>
          I hereby represent and declare to the best of my knowledge that at the
          time of purchase of my Life Plan:
        </Body>
      </VStack>

      <VStack align="stretch" gap={4} mb={4}>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            I am between 18 years and 60 years old (not beyond my 60th
            birthday).
          </Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            I possess sound health and am able to perform the normal activities
            in pursuit of my livelihood.
          </Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            I have not consulted any physician for heart condition,
            hypertension, cancer, diabetes, lungs, kidneys or intestinal
            disorder, tuberculosis, or any other physical impairment nor have I
            been confined in a hospital/clinic and received any medical or
            surgical attention.
          </Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            I understand and agree that I am INSURABLE based on the above-stated
            representations.
          </Checkbox.Label>
        </Checkbox.Root>
        <Box mt={4}>
          <Body>Please attach medical results here:</Body>
        </Box>

        <UploadFile />
        <VStack align="stretch" gap={2} mt={6}>
          <Body>
            I also understand and agree that the issuance of the Life Plan and
            the corresponding benefits are based on the truth of my above-stated
            representations.
          </Body>
          <Body>
            Any false statements as regards my age or health as above-stated may
            render the Life Plan Contract rescissible.
          </Body>
          <Body>
            I further agree that this contract and the declarations I have given
            above shall be the basis of the Life Plan Contract between the
            company and me and shall be deemed to be an integral part of the
            Life Plan Contract, subject to the terms and conditions stated in
            the Life Plan Contract.
          </Body>
        </VStack>
        <Separator />
        <Box textAlign="start">
          <H4>Terms and Conditions</H4>
        </Box>
        <Box textAlign="start">
          <Body>
            Please read the terms and conditions of St .Peter Life Plan and
            upload the necessary documents to proceed with the purchase.
          </Body>
        </Box>
        <Accordion.Root
          value={value}
          onValueChange={(e) => setValue(e.value)}
          collapsible
        >
          {items.map((item, index) => (
            <Accordion.Item key={index} value={item.value}>
              <Accordion.ItemTrigger>
                <Body>
                  <Span fontWeight="semibold">{item.title}</Span>
                </Body>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>{item.text}</Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </VStack>
    </>
  );
};

export default HealthDeclaration;
