// Author: Jimwell Ocsio

import { BoxProps } from "@chakra-ui/react";

export type TextStyleProps = "fontSize" | "fontWeight" | "letterSpacing";
export type TextProps = Omit<BoxProps, TextStyleProps> & { children: React.ReactNode };