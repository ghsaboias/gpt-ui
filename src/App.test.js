import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders chat with gpt", () => {
  render(<App />);
  const linkElement = screen.getByText(/chat with gpt/i);
  expect(linkElement).toBeInTheDocument();
});
