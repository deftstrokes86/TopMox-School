/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        "deep-navy": "hsl(var(--deep-navy))",
        "royal-blue": "hsl(var(--royal-blue))",
        "soft-blue": "hsl(var(--soft-blue))",
        "warm-gold": "hsl(var(--warm-gold))",
        "soft-gold": "hsl(var(--soft-gold))",
        "warm-ivory": "hsl(var(--warm-ivory))",
        "soft-cream": "hsl(var(--soft-cream))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))"
        }
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)"
      },
      boxShadow: {
        soft: "0 12px 28px -18px rgba(7, 24, 46, 0.45)",
        card: "0 14px 32px -20px rgba(7, 24, 46, 0.35)",
        lifted: "0 20px 45px -24px rgba(7, 24, 46, 0.55)"
      },
      backgroundImage: {
        "brand-sheen":
          "radial-gradient(circle at 18% 12%, rgba(245, 214, 130, 0.24), transparent 38%), radial-gradient(circle at 88% 4%, rgba(45, 117, 200, 0.2), transparent 42%)"
      }
    }
  },
  plugins: []
};
