# 🏷️ Expense Categories

**Status:** 📋 Planned  
**Priority:** ⭐ High-Impact  
**Estimated Time:** 4-5 days  
**Dependencies:** Database schema update, Icon library

## 📝 **Overview**

Add predefined and custom expense categories with icons and colors to improve expense organization and enable category-based analytics.

## 🎯 **Goals**

1. **Predefined Categories:** Common expense categories with icons
2. **Custom Categories:** Allow users to create custom categories
3. **Visual Organization:** Color-coded categories with icons
4. **Analytics Ready:** Enable category-based filtering and reports

## 🔧 **Technical Implementation**

### **Database Schema**

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, group_id)
);

-- Add category_id to expenses table
ALTER TABLE expenses 
ADD COLUMN category_id UUID REFERENCES categories(id);

-- Insert default categories
INSERT INTO categories (name, icon, color, is_default) VALUES
('Food & Dining', '🍕', '#F59E0B', true),
('Transportation', '🚗', '#3B82F6', true),
('Entertainment', '🎬', '#EC4899', true),
('Housing', '🏠', '#10B981', true),
('Healthcare', '💊', '#EF4444', true),
('Shopping', '🛒', '#8B5CF6', true),
('Utilities', '⚡', '#F97316', true),
('Travel', '✈️', '#06B6D4', true),
('Education', '📚', '#84CC16', true),
('Other', '📦', '#6B7280', true);
```

### **Type Definitions**

```typescript
// src/types/category.ts
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  group_id?: string;
  created_at: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'created_at' | 'group_id'>[] = [
  { name: 'Food & Dining', icon: '🍕', color: '#F59E0B', is_default: true },
  { name: 'Transportation', icon: '🚗', color: '#3B82F6', is_default: true },
  { name: 'Entertainment', icon: '🎬', color: '#EC4899', is_default: true },
  { name: 'Housing', icon: '🏠', color: '#10B981', is_default: true },
  { name: 'Healthcare', icon: '💊', color: '#EF4444', is_default: true },
  { name: 'Shopping', icon: '🛒', color: '#8B5CF6', is_default: true },
  { name: 'Utilities', icon: '⚡', color: '#F97316', is_default: true },
  { name: 'Travel', icon: '✈️', color: '#06B6D4', is_default: true },
  { name: 'Education', icon: '📚', color: '#84CC16', is_default: true },
  { name: 'Other', icon: '📦', color: '#6B7280', is_default: true },
];
```

### **API Functions**

```typescript
// src/api/categories.ts
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const getCategories = async (groupId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`group_id.eq.${groupId},is_default.eq.true`)
    .order('is_default', { ascending: false })
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpenseCategory = async (expenseId: string, categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .update({ category_id: categoryId })
    .eq('id', expenseId);

  if (error) throw error;
};
```

### **Category Selector Component**

```typescript
// src/components/CategorySelector.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Category } from '@/types/category';
import { getCategories } from '@/api/categories';

interface CategorySelectorProps {
  groupId: string;
  selectedCategory?: Category;
  onCategorySelect: (category: Category) => void;
}

export function CategorySelector({ groupId, selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [groupId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories(groupId);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCategory.icon}</span>
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select category</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="justify-start h-auto p-3"
              onClick={() => {
                onCategorySelect(category);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </div>
            </Button>
          ))}
          <Button
            variant="dashed"
            className="justify-start h-auto p-3"
            onClick={() => {
              // Open create category modal
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">New Category</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## 🎨 **UI/UX Design**

### **Category Display**

- **Icon + Name:** Large emoji icons with category names
- **Color Coding:** Each category has a distinctive color
- **Grid Layout:** 2-column grid for category selection
- **Search:** Quick search/filter for many categories

### **Category Badge**

```typescript
// Component for displaying category in expense lists
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge 
      variant="secondary"
      style={{ backgroundColor: `${category.color}20`, color: category.color }}
      className="flex items-center gap-1"
    >
      <span>{category.icon}</span>
      <span className="text-xs">{category.name}</span>
    </Badge>
  );
}
```

## 📱 **Implementation Steps**

1. **Database Setup**
   - [ ] Create categories table
   - [ ] Add category_id to expenses table
   - [ ] Insert default categories
   - [ ] Create necessary indexes

2. **API Layer**
   - [ ] Create category API functions
   - [ ] Add category CRUD operations
   - [ ] Update expense API to include categories

3. **UI Components**
   - [ ] Build CategorySelector component
   - [ ] Create CategoryBadge component
   - [ ] Add CreateCategoryModal
   - [ ] Update expense forms

4. **Integration**
   - [ ] Add category selection to expense creation
   - [ ] Display categories in expense lists
   - [ ] Add category filtering
   - [ ] Update expense editing

5. **Analytics Preparation**
   - [ ] Category-based expense grouping
   - [ ] Category totals calculation
   - [ ] Prepare for chart integration

## ✅ **Testing Checklist**

- [ ] Default categories are created for new groups
- [ ] Custom categories can be created and saved
- [ ] Category selection works in expense forms
- [ ] Category badges display correctly
- [ ] Category filtering functions properly
- [ ] Categories persist across sessions
- [ ] Category colors display consistently

## 🔗 **Resources**

- [Emoji Categories Reference](https://emojipedia.org/symbols/)
- [Color Psychology in UI](https://www.smashingmagazine.com/2010/01/color-theory-for-designers-part-1-the-meaning-of-color/)
- [Category UX Best Practices](https://www.nngroup.com/articles/category-naming/)

## 💡 **Future Enhancements**

- Category spending budgets
- Category-based notifications
- Smart category suggestions based on expense description
- Category icons from icon libraries (Lucide, Heroicons)
- Subcategories for detailed organization
- Category spending trends and insights

---

**Files to Create/Modify:**
- `src/types/category.ts` (new)
- `src/api/categories.ts` (new)
- `src/components/CategorySelector.tsx` (new)
- `src/components/CategoryBadge.tsx` (new)
- `src/components/AddExpenseDialog.tsx` (update)
- Database migration scripts
