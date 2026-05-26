import { defineSlotRecipe } from "@chakra-ui/react";
import { breadcrumbAnatomy } from "./breadcrumb.anatomy";

export const breadcrumbSlotRecipe = defineSlotRecipe({
  className: "st-peter-breadcrumb",
  slots: breadcrumbAnatomy.keys(),
  base: {
    list: {
      display: "flex",
      alignItems: "center",
      wordBreak: "break-word",
      color: "fg.muted",
      listStyle: "none",
    },
    link: {
      outline: "0",
      textDecoration: "none",
      borderRadius: "l1",
      focusRing: "outside",
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
    },
    separator: {
      color: "foreground.muted",
      opacity: "0.8",
      _icon: {
        boxSize: "1em",
      },
      _rtl: {
        rotate: "180deg",
      },
    },
    ellipsis: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      _icon: {
        boxSize: "1em",
      },
    },
  },

  variants: {
    variant: {
      underline: {
        link: {
          color: "foreground",
          textDecoration: "underline",
          textUnderlineOffset: "0.2em",
          textDecorationColor: "colorPalette.muted",
        },
        currentLink: {
          color: "foreground",
        },
      },
      plain: {
        link: {
          color: "foreground",
          _hover: {
            color: "primary",
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
          },
          _focus: {
            color: "primary",
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
            outline: "none",
            boxShadow: "outline",
          },
        },
        currentLink: {
          color: "foreground",
          fontWeight: "medium",
        },
      },
    },

    size: {
      sm: {
        list: {
          gap: "1",
          textStyle: "xs",
        },
      },
      md: {
        list: {
          gap: "1.5",
          textStyle: "sm",
        },
      },
      lg: {
        list: {
          gap: "2",
          textStyle: "md",
        },
      },
    },
  },

  defaultVariants: {
    variant: "plain",
    size: "md",
  },
});
