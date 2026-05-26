import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";
import { PlanDetailType } from "../planholders.types";

export function EditPlanDetails({props} : {props : PlanDetailType}) {
  return (
    <Dialog.Root size={"lg"}>
      <Dialog.Trigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <LuPencil /> Edit
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Plan Details</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
