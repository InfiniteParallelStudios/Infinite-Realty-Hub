# 🚀 VS Code Setup Guide for Infinite Realty Hub

## 📋 Overview
Complete VS Code configuration guide for React Native development with Infinite Realty Hub. This guide ensures all team members have a consistent and optimized development experience.

## 🎯 Essential VS Code Extensions

### Core React Native Development
```bash
# Install via VS Code Extensions panel or command line
code --install-extension msjsdiag.vscode-react-native
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension pmneo.tsimporter
code --install-extension eamodio.gitlens
code --install-extension rangav.vscode-thunder-client
```

### Extension Details

#### 1. React Native Tools (`msjsdiag.vscode-react-native`)
- **Purpose**: IntelliSense, debugging, and integrated commands for React Native
- **Features**:
  - Debug React Native apps directly in VS Code
  - IntelliSense for React Native APIs
  - Integrated terminal commands
  - Metro bundler integration

#### 2. ES7+ React/Redux/GraphQL/React-Native Snippets (`dsznajder.es7-react-js-snippets`)
- **Purpose**: Code snippets for faster React Native development
- **Key Snippets**:
  - `rnfe` - React Native functional export component
  - `rnfs` - React Native functional component with stylesheet
  - `imp` - Import statement
  - `clg` - Console.log

#### 3. Prettier - Code Formatter (`esbenp.prettier-vscode`)
- **Purpose**: Automatic code formatting
- **Configuration**: Already configured in `.prettierrc`
- **Features**:
  - Format on save
  - Consistent code style across team
  - TypeScript support

#### 4. ESLint (`ms-vscode.vscode-eslint`)
- **Purpose**: JavaScript/TypeScript linting and error detection
- **Features**:
  - Real-time error highlighting
  - Auto-fix suggestions
  - React Native specific rules

#### 5. TypeScript Importer (`pmneo.tsimporter`)
- **Purpose**: Auto import for TypeScript modules
- **Features**:
  - Automatic import statements
  - Organize imports
  - Remove unused imports

#### 6. GitLens (`eamodio.gitlens`)
- **Purpose**: Enhanced Git capabilities in VS Code
- **Features**:
  - Line-by-line Git blame information
  - Git history and timeline
  - Branch comparison
  - Commit details

#### 7. Thunder Client (`rangav.vscode-thunder-client`)
- **Purpose**: API testing directly in VS Code
- **Features**:
  - REST API testing
  - GraphQL support
  - Environment variables
  - Collection management

## ⚙️ VS Code Settings Configuration

### Workspace Settings (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.suggest.autoImports": true,
  "javascript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/ios/build": true,
    "**/android/build": true,
    "**/android/.gradle": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/ios/build": true,
    "**/android/build": true
  },
  "react-native-tools.showUserTips": false,
  "react-native-tools.logLevel": "Info"
}
```

### User Settings Recommendations
Add these to your global VS Code settings (`Cmd+,` → Open Settings JSON):

```json
{
  "editor.fontFamily": "'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.5,
  "editor.minimap.enabled": false,
  "editor.wordWrap": "on",
  "workbench.iconTheme": "vs-seti",
  "terminal.integrated.fontSize": 13,
  "git.autofetch": true,
  "git.confirmSync": false
}
```

## 🐛 Debug Configuration

### Launch Configuration (`.vscode/launch.json`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Debug iOS",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "ios"
    },
    {
      "name": "Attach to packager",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "attach"
    }
  ]
}
```

### Task Configuration (`.vscode/tasks.json`)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Metro",
      "type": "shell",
      "command": "npm",
      "args": ["start"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "runOptions": {
        "runOn": "folderOpen"
      }
    },
    {
      "label": "Run iOS",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ios"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Run Android",
      "type": "shell",
      "command": "npm",
      "args": ["run", "android"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

## 🎨 Theme & Appearance Recommendations

### Recommended Themes
- **Dark**: GitHub Dark Default, One Dark Pro, Dracula Official
- **Light**: GitHub Light Default, Atom One Light

### Font Recommendations
- **Fira Code** (with ligatures)
- **JetBrains Mono**
- **Cascadia Code**
- **SF Mono** (macOS)

## ⌨️ Essential Keyboard Shortcuts

### React Native Development
- `Cmd+Shift+P` - Command Palette
- `Cmd+R` - Reload React Native app (iOS Simulator)
- `Cmd+D` - Open React Native dev menu (iOS Simulator)
- `Cmd+M` - Open React Native dev menu (Android Emulator)

### Code Navigation
- `Cmd+P` - Quick file open
- `Cmd+Shift+O` - Go to symbol in file
- `Cmd+T` - Go to symbol in workspace
- `F12` - Go to definition
- `Alt+F12` - Peek definition

### Editing
- `Cmd+D` - Select next occurrence
- `Cmd+Shift+L` - Select all occurrences
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Copy line up/down

## 🔧 Troubleshooting

### Common Issues

#### 1. Extensions Not Working
```bash
# Reload VS Code window
Cmd+Shift+P → "Developer: Reload Window"

# Reinstall extensions
code --uninstall-extension msjsdiag.vscode-react-native
code --install-extension msjsdiag.vscode-react-native
```

#### 2. TypeScript Errors
```bash
# Restart TypeScript server
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 3. Formatting Issues
```bash
# Check Prettier configuration
# Ensure .prettierrc exists in project root
# Verify default formatter is set to Prettier
```

#### 4. Metro Bundler Issues
```bash
# Reset Metro cache
npm start -- --reset-cache

# Or use React Native CLI
npx react-native start --reset-cache
```

### Performance Optimization

#### Exclude Large Directories
Add these to your workspace settings to improve performance:
```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/ios/build": true,
    "**/android/build": true,
    "**/android/.gradle": true,
    "**/ios/Pods": true
  }
}
```

#### Disable Unused Features
```json
{
  "editor.minimap.enabled": false,
  "editor.wordBasedSuggestions": false,
  "extensions.autoUpdate": false
}
```

## 🚀 Quick Setup Script

Create this script to automate VS Code setup:

```bash
#!/bin/bash
# setup-vscode.sh

echo "🚀 Setting up VS Code for Infinite Realty Hub development..."

# Install essential extensions
code --install-extension msjsdiag.vscode-react-native
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension pmneo.tsimporter
code --install-extension eamodio.gitlens
code --install-extension rangav.vscode-thunder-client

echo "✅ VS Code extensions installed!"
echo "📖 Please review VS_CODE_SETUP.md for configuration details"
```

## 📚 Additional Resources

- [VS Code React Native Documentation](https://code.visualstudio.com/docs/nodejs/reactnative-tutorial)
- [React Native Tools Extension Guide](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
- [VS Code TypeScript Documentation](https://code.visualstudio.com/docs/languages/typescript)
- [Prettier VS Code Integration](https://prettier.io/docs/en/editors.html#visual-studio-code)

## 🤝 Team Collaboration

### Shared Configuration
- All workspace settings are committed to the repository
- Extensions list is documented and scripted
- Debug configurations are shared across team

### Best Practices
1. **Consistent Formatting**: Use Prettier with shared configuration
2. **Code Quality**: Enable ESLint with shared rules
3. **Version Control**: Use GitLens for better Git integration
4. **Documentation**: Keep this guide updated with team preferences

---

**Last Updated**: July 15, 2025  
**Maintainer**: @InfiniteParallelStudios  
**Version**: 1.0.0
