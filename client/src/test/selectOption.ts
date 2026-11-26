import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/** Select an option through the real Radix trigger and portal. */
export async function selectOption(index: number, name: string) {
  await userEvent.click(screen.getAllByRole("combobox")[index]!);
  await userEvent.click(await screen.findByRole("option", { name }));
}
