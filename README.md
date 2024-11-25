# Water Watch Pro - Developer Onboarding Guide 1.1

Welcome to **Water Watch Pro**, a React-based application that enables users to monitor rainfall history and forecasts for specific lat/lng locations using raw data from the National Weather Center. This README will guide you through setting up the project locally, working with Jira, managing branches, and deploying to Netlify.

## Repository Information

- **GitHub Repository**: [Water Watch Pro GitHub](https://github.com/gitgregoryjones/water-watch-pro)
- **Primary Tech Stack**: React, Vite, Google Maps API, Netlify for deployment

## Getting Started

### Prerequisites

1. **Node.js**: Ensure Node.js is installed on your machine. We recommend using the latest stable version.
2. **Git**: For cloning the repository and branch management.
3. **Environment Variable**:
   - `VITE_GOOGLE_API_KEY`: This is required for Google Maps integration. Without this key, the app will not start, and you will see a Google Maps API error in the console.

### Setting Up the Project

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/gitgregoryjones/water-watch-pro.git
   cd water-watch-pro
   ```

2. **Install Dependencies**:
   - The app uses **Vite** for bundling and managing dependencies.
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root of the project and add your Google API key:
     ```env
     VITE_GOOGLE_API_KEY=your_google_api_key_here
     ```

4. **Run the Application**:
   - To start the development server, use:
     ```bash
     npm run dev
     ```
   - The app should be accessible at `http://localhost:3000`.

5. **Build the Application**:
   - For production builds, run:
     ```bash
     npm run build
     ```
   - To preview the build:
     ```bash
     npm run preview
     ```

## Working with Jira

### Jira Project Board

- **Jira URL**: [Water Watch Pro Jira Board](https://blinkprojects.atlassian.net/jira/software/projects/DP/boards/1)
- The Jira board is integrated with GitHub, so issues are automatically linked to branches based on branch naming conventions and commit messages.

### Branch Naming and Commit Messages

- **Branch Naming**: Use the Jira issue number as the branch name to automatically link the branch to the corresponding Jira issue.
  - Example: `DP-1234`
- **Commit Messages**: Include the Jira ticket number in each commit message to update Jira on issue progress.
  - Example: `git commit -m "DP-1234: Fix map loading issue"`

## Branches and CI/CD with Netlify

### Development Branch and Deployments

- **Development Branch**: All feature and bug branches should be merged into the `development` branch.
- **Production Branch**: The development branch should be merged into the `production` branch.
- **Automatic Deployment**: Merging into `development` will trigger a Netlify build. The deployment can be viewed at:
  - **Development Build**: [Water Watch Pro Development Deployment](https://dev-water-watch-pro.netlify.app/)
- **Automatic Deployment**: Merging into `main` will trigger a Production Netlify build. The deployment can be viewed at:
   - **Production Build**: [Water Watch Pro Development Deployment](https://dwater-watch-pro.netlify.app/)

### Netlify Dashboard

- Manage CI/CD settings, create new deploy branches, and monitor builds on the Netlify dashboard:
  - **Netlify Dashboard**: [Netlify Dashboard](https://app.netlify.com/teams/gitgregoryjones/sites)

## Additional Information

### Vite

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview Build**: `npm run preview`

### Code Style and Best Practices

- Follow standard React and JavaScript conventions.
- Ensure that branches are up-to-date with `development` before opening pull requests.
- Write descriptive commit messages and include the Jira issue number.

## Contributing

- Before making major changes, consider discussing them with the project maintainers.
- Always check for Jira issues assigned to you and keep the Jira board updated.
- Push code only to feature/bug branches named after the Jira issue, then open a pull request to merge into `development`.

### Thank You!

We’re excited to have you contributing to **Water Watch Pro**! If you have any questions, reach out to the project maintainers. Happy coding!
