// themes.js
import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#2563EB', // Vibrant blue
    light: '#93C5FD',
    dark: '#1E40AF',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#F97316', // Energetic orange for timers/focus
    light: '#FDBA74',
    dark: '#C2410C',
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#10B981', // Green for completed tasks
    light: '#6EE7B7',
    dark: '#059669',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#EF4444', // Red for alerts/warnings
    light: '#FCA5A5',
    dark: '#B91C1C',
    contrastText: '#FFFFFF'
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// Common components styling
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        }
      },
      containedPrimary: {
        background: `linear-gradient(45deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
      },
      containedSecondary: {
        background: `linear-gradient(45deg, ${colors.secondary.dark} 0%, ${colors.secondary.main} 100%)`,
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
        }
      }
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary.light
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2
          }
        }
      }
    }
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        margin: '16px 0'
      }
    }
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600
      }
    }
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        padding: '0 24px',
        '@media (min-width: 600px)': {
          padding: '0 24px'
        }
      }
    }
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        padding: '10px 16px'
      }
    }
  }
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    background: {
      default: colors.gray[50],
      paper: '#FFFFFF'
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600]
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 700
    },
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 500
    },
    subtitle2: {
      fontWeight: 500
    },
    button: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', 
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000',
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000'
  ],
  components
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.light,
      light: colors.primary.main,
      dark: '#3B82F6',
      contrastText: colors.gray[900]
    },
    secondary: {
      main: colors.secondary.light,
      light: colors.secondary.main,
      dark: '#F97316',
      contrastText: colors.gray[900]
    },
    success: {
      main: colors.success.light,
      light: colors.success.main,
      dark: '#10B981'
    },
    error: {
      main: colors.error.light,
      light: colors.error.main,
      dark: '#EF4444'
    },
    background: {
      default: colors.gray[900],
      paper: colors.gray[800]
    },
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[400]
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 700
    },
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 500
    },
    subtitle2: {
      fontWeight: 500
    },
    button: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.15)',
    '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.2)',
    '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.15)',
    '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.15)',
    '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)',
    '0 25px 50px -12px rgba(0,0,0,0.4)',
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', 
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000',
    '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000', '0 0 #0000'
  ],
  components: {
    ...components,
    MuiButton: {
      ...components.MuiButton,
      styleOverrides: {
        ...components.MuiButton.styleOverrides,
        containedPrimary: {
          background: `linear-gradient(45deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
          color: colors.gray[900]
        },
        containedSecondary: {
          background: `linear-gradient(45deg, ${colors.secondary.light} 0%, ${colors.secondary.main} 100%)`,
          color: colors.gray[900]
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

export default { lightTheme, darkTheme };