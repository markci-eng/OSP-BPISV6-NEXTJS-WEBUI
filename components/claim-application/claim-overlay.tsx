'use client'

import { Button, createOverlay, Dialog, Flex, Portal, Separator, Strong } from '@chakra-ui/react'
import React from 'react'
import { PrimarySmButton } from 'st-peter-ui'

interface DialogProps {
    title: string,
    description?: string,
    content?: React.ReactNode,
    onConfirm: () => void,
    onCancel: () => void
}

const dialog = createOverlay<DialogProps>((props) => {
  const { title, description, content, onOpenChange, onConfirm, onCancel, ... rest } = props;
  
  const handleSubmit = () => {
    onOpenChange?.({open: false});
  }

  const onConfirmClick = () => {
    handleSubmit();
    props.onConfirm();
  }

  const onCancelClick = () => {
    handleSubmit();
    props.onCancel();
  }

  return (
    <Dialog.Root {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {title && (
              <Dialog.Header>
                <Dialog.Title><Strong color="gray.700">{title}</Strong></Dialog.Title>
              </Dialog.Header>
            )}
            
            <Dialog.Body spaceY="4">
              {description && (
                <Dialog.Description>{description}</Dialog.Description>
              )}
              <Separator />
              {content}

              <Flex gap={3} justifyContent="flex-end">
                <Button size="sm" variant="outline" onClick={onCancelClick}>Cancel</Button>
                <PrimarySmButton onClick={onConfirmClick}>Confirm</PrimarySmButton>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})

interface MainDialogProps {
  id: string,
  title: string,
  description?: string,
  content?: React.ReactNode,
  btnMessage: React.ReactNode,
  onConfirm: () => void,
  onCancel: () => void
}

const ClaimsOverlay = (props: MainDialogProps) => {
    const { id, title, description, content, btnMessage, onConfirm, onCancel,... rest } = props;
    
    return (
        <>
            <PrimarySmButton onClick={() => {
                dialog.open(id, {
                    title: title,
                    description: description,
                    content: content,
                    onConfirm: onConfirm,
                    onCancel: onCancel
                })
            }}>{btnMessage}</PrimarySmButton>
            <dialog.Viewport />
        </>
    )
}
export default ClaimsOverlay