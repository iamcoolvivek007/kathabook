# Contributing to LogiDash

Thank you for your interest in contributing to LogiDash! We welcome contributions from the community to help make this project better.

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior. (Note: A formal CODE_OF_CONDUCT.md file can be added later).

## How to Contribute

If you'd like to contribute, please follow these steps:

1.  **Fork the Repository:** Start by forking the main repository to your own GitHub account.
2.  **Create a New Branch:** For each new feature or bug fix, create a new branch from `main`:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/bug-description
    ```
3.  **Make Your Changes:** Write your code, following the project's coding style and conventions.
4.  **Commit Your Changes:** Write clear, concise commit messages.
    ```bash
    git commit -m "feat: Add new reporting widget"
    ```
5.  **Push to Your Fork:**
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Submit a Pull Request:** Open a pull request from your forked repository to the `main` branch of the original repository. Provide a detailed description of the changes you've made.

## Development Setup

The project is designed to be simple to run.

1.  Clone your forked repository.
2.  Open the `index.html` file in a modern web browser. Most modern browsers support ES modules directly from the filesystem for development purposes. For a more robust setup, you can use a simple live server extension in your code editor (like VS Code's "Live Server").

## Coding Style & Conventions

- **TypeScript:** Use TypeScript for all new code. Ensure your code is well-typed.
- **React:**
  - Use functional components and React Hooks.
  - Keep components small and focused on a single responsibility.
- **Tailwind CSS:**
  - Utilize Tailwind's utility classes for all styling. Avoid writing custom CSS files unless absolutely necessary for a complex, unique component.
- **File Naming:**
  - Components: `PascalCase.tsx` (e.g., `PageHeader.tsx`)
  - Other files: `camelCase.ts` (e.g., `useLogisticsState.ts`)
- **Code Formatting:** Use a code formatter like Prettier to maintain a consistent style.

## Reporting Bugs or Requesting Features

If you find a bug or have an idea for a new feature, please open an issue on the GitHub repository. Provide as much detail as possible, including steps to reproduce for bugs.
