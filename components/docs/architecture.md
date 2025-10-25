# LogiDash Architecture

This document outlines the technical architecture of the LogiDash application. The primary goals of this architecture are maintainability, scalability, and developer efficiency.

## 1. Frontend Framework

### React & TypeScript

- **React:** The application is built using React, a component-based JavaScript library for building user interfaces. This allows us to create encapsulated components that manage their own state, making the UI complex but manageable.
- **TypeScript:** We use TypeScript to add static typing to JavaScript. This enhances code quality and understandability, reduces runtime errors, and improves the developer experience with better autocompletion and type checking.

## 2. Styling

### Tailwind CSS

LogiDash uses Tailwind CSS, a utility-first CSS framework. This choice was made for several reasons:
- **Rapid Prototyping:** Quickly build and style components without writing custom CSS.
- **Consistency:** Enforces a consistent design system (spacing, colors, typography) across the application.
- **Performance:** Produces highly optimized, small CSS files by purging unused styles.
- **Maintainability:** Styles are co-located with the component markup, making them easy to find and update.

## 3. State Management

### Custom React Hook (`useLogisticsState`)

For the current scale of the application, we employ a centralized custom hook, `useLogisticsState`, to manage the global application state.

- **How it Works:** This hook initializes and manages all major data slices (loads, trucks, trips, etc.) using `React.useState`. It exposes the state and a set of memoized functions (e.g., `addLoad`, `updateTrip`) for performing CRUD operations.
- **Why this approach?** It's simple, lightweight, and avoids the boilerplate of more complex libraries. It leverages React's native state management capabilities effectively for a small-to-medium-sized application.
- **Data Flow:** The state is provided from the root `App` component and passed down to child components via props. This enforces a clear, unidirectional data flow.

### Future Considerations

As the application grows, we may encounter limitations with this approach, especially concerning performance and prop-drilling. If that happens, we will consider migrating to a more robust state management library like **Zustand** or **Redux Toolkit**.

## 4. Component Structure

The application's components are organized within the `src/components` directory. The structure is as follows:

- **Views:** Top-level components that represent a full page or major section (e.g., `Dashboard.tsx`, `LoadManagement.tsx`). These components are responsible for fetching and composing data for their specific domain.
- **Shared/Reusable Components:** Smaller, general-purpose components used across multiple views (e.g., `Modal.tsx`, `StatCard.tsx`, `PageHeader.tsx`, `FileInput.tsx`). These components are designed to be generic and customizable via props.
- **Forms:** Form logic is encapsulated within dedicated components (e.g., `TransactionForm.tsx`, `LoadForm.tsx`) to keep view components clean.

## 5. Data Model

All data types and enumerations are centrally defined in `src/types.ts`. This provides a single source of truth for our data structures and ensures type consistency throughout the application. Initial mock data is stored in `src/constants.ts` for development and demonstration purposes.
