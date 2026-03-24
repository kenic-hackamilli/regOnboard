export const onboardTheme = {
  colors: {
    primary: "#E30613",
    secondary: "#009739",
    dark: "#1A1A1A",
    light: "#F5F5F5",
    accent: "#666666",
    white: "#FFFFFF",
    black: "#000000",
    blue: "#007BFF",
    success: "#28A745",
    warning: "#FFC107",
    error: "#DC3545",
    info: "#17A2B8",
    gray100: "#F8F9FA",
    gray200: "#E9ECEF",
    gray300: "#DEE2E6",
    gray400: "#CED4DA",
    gray500: "#ADB5BD",
    gray600: "#6C757D",
    gray700: "#495057",
    gray800: "#343A40",
    gray900: "#212529",
    accent1: "#E3F2FD",
  },
  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px",
  },
  shadow: {
    card: "0 12px 32px rgba(26,26,26,0.08)",
  },
};

export const buildCssVariables = () => `
:root {
  --primary: ${onboardTheme.colors.primary};
  --secondary: ${onboardTheme.colors.secondary};
  --dark: ${onboardTheme.colors.dark};
  --light: ${onboardTheme.colors.light};
  --accent: ${onboardTheme.colors.accent};
  --white: ${onboardTheme.colors.white};
  --black: ${onboardTheme.colors.black};
  --blue: ${onboardTheme.colors.blue};
  --success: ${onboardTheme.colors.success};
  --warning: ${onboardTheme.colors.warning};
  --error: ${onboardTheme.colors.error};
  --info: ${onboardTheme.colors.info};
  --gray100: ${onboardTheme.colors.gray100};
  --gray200: ${onboardTheme.colors.gray200};
  --gray300: ${onboardTheme.colors.gray300};
  --gray400: ${onboardTheme.colors.gray400};
  --gray500: ${onboardTheme.colors.gray500};
  --gray600: ${onboardTheme.colors.gray600};
  --gray700: ${onboardTheme.colors.gray700};
  --gray800: ${onboardTheme.colors.gray800};
  --gray900: ${onboardTheme.colors.gray900};
  --accent1: ${onboardTheme.colors.accent1};
  --radius-sm: ${onboardTheme.radius.sm};
  --radius-md: ${onboardTheme.radius.md};
  --radius-lg: ${onboardTheme.radius.lg};
  --shadow-card: ${onboardTheme.shadow.card};
}
`;
