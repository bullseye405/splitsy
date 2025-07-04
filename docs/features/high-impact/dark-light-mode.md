# 🌙 Dark/Light Mode Toggle

**Status:** 📋 Planned  
**Priority:** ⭐ High-Impact  
**Estimated Time:** 3-4 days  
**Dependencies:** Theme system setup

## 📝 **Overview**

Implement a comprehensive dark/light mode toggle that enhances user experience and makes the app more appealing for portfolio showcase.

## 🎯 **Goals**

1. **Theme System:** Create a robust theme switching system
2. **Persistence:** Save user preference in localStorage
3. **Smooth Transitions:** Add elegant theme switching animations
4. **Accessibility:** Ensure proper contrast ratios for both themes

## 🔧 **Technical Implementation**

### **Context Setup**

```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### **Toggle Component**

```typescript
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="transition-all duration-300 hover:scale-110"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-transform duration-500 rotate-0" />
      ) : (
        <Sun className="h-5 w-5 transition-transform duration-500 rotate-180" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### **Tailwind Configuration**

```javascript
// tailwind.config.ts - Add dark mode support
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... other colors
      },
      animation: {
        'theme-switch': 'theme-switch 0.3s ease-in-out',
      },
    },
  },
};
```

## 🎨 **UI/UX Design**

### **Color Scheme**

**Light Mode:**
- Background: `#ffffff`
- Card Background: `#f8fafc`
- Text Primary: `#0f172a`
- Text Secondary: `#64748b`

**Dark Mode:**
- Background: `#0f172a`
- Card Background: `#1e293b`
- Text Primary: `#f1f5f9`
- Text Secondary: `#94a3b8`

### **Visual Elements**

- Smooth 300ms transitions between themes
- Moon/Sun icon rotation animation
- Subtle gradient overlays for depth
- Proper focus states for accessibility

## 📱 **Implementation Steps**

1. **Setup Theme Context**
   - [ ] Create ThemeContext and provider
   - [ ] Add localStorage persistence
   - [ ] Implement theme detection

2. **Update CSS Variables**
   - [ ] Define dark/light color tokens
   - [ ] Update shadcn/ui theme configuration
   - [ ] Add transition animations

3. **Create Toggle Component**
   - [ ] Design theme toggle button
   - [ ] Add smooth icon transitions
   - [ ] Implement accessibility features

4. **Update Components**
   - [ ] Wrap app with ThemeProvider
   - [ ] Add toggle to header/navigation
   - [ ] Test all UI components in both themes

5. **Testing & Polish**
   - [ ] Test theme persistence
   - [ ] Verify accessibility compliance
   - [ ] Optimize transition performance

## ✅ **Testing Checklist**

- [ ] Theme persists after page reload
- [ ] All components look good in both themes
- [ ] Smooth transitions without flicker
- [ ] Toggle button is accessible
- [ ] System preference detection works
- [ ] No console errors during theme switch

## 🔗 **Resources**

- [shadcn/ui Dark Mode Guide](https://ui.shadcn.com/docs/dark-mode)
- [Next.js Theme Documentation](https://nextjs.org/docs/advanced-features/next-themes)
- [CSS Variables for Theming](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## 💡 **Future Enhancements**

- System preference detection
- Multiple theme options (auto, light, dark)
- Theme-based illustrations
- Custom accent color selection

---

**Files to Create/Modify:**
- `src/contexts/ThemeContext.tsx` (new)
- `src/components/ThemeToggle.tsx` (new)
- `src/App.tsx` (wrap with provider)
- `tailwind.config.ts` (update)
- `src/index.css` (add CSS variables)
