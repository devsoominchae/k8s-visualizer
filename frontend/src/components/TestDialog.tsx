import { Button, Dialog, Flex } from "@radix-ui/themes";

export default function TestDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Title>Test</Dialog.Title>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
