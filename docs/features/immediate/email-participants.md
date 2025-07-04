# 📧 Email for Participants

**Status:** 📋 Planned  
**Priority:** 🔥 Immediate  
**Estimated Time:** 2-3 days  
**Dependencies:** Database schema update

## 📝 **Overview**

Add email field to participants to enable future features like email invitations, notifications, and better participant identification.

## 🎯 **Goals**

1. **Database Enhancement:** Add email field to participants table
2. **UI Updates:** Add email input to participant creation/editing forms
3. **Validation:** Implement email validation and uniqueness checks
4. **Foundation:** Prepare for email invitation system

## 🔧 **Technical Implementation**

### **Database Schema Update**

```sql
-- Add email column to participants table
ALTER TABLE participants 
ADD COLUMN email VARCHAR(255) UNIQUE;

-- Create index for email lookups
CREATE INDEX idx_participants_email ON participants(email);
```

### **Type Updates**

```typescript
// Update participant type
interface Participant {
  id: string;
  name: string;
  email?: string; // Optional for backward compatibility
  group_id: string;
  created_at: string;
}
```

### **Component Updates**

**Files to modify:**
- `src/components/ParticipantsModal.tsx`
- `src/components/AddParticipantDialog.tsx`
- `src/types/participants.ts`

## 📋 **Implementation Steps**

### Phase 1: Database & Types
- [ ] Update Supabase participants table schema
- [ ] Update TypeScript participant interface
- [ ] Test database changes in development

### Phase 2: UI Components
- [ ] Add email input field to add participant form
- [ ] Add email input field to edit participant form
- [ ] Implement email validation (format, uniqueness)
- [ ] Update participant display to show email

### Phase 3: Validation & Error Handling
- [ ] Email format validation
- [ ] Duplicate email checking
- [ ] Error message display
- [ ] Form submission handling

### Phase 4: Testing
- [ ] Test email validation
- [ ] Test duplicate email handling
- [ ] Test backward compatibility (existing participants without email)
- [ ] Mobile responsiveness testing

## 🎨 **UI Design Considerations**

### **Add Participant Form**
```tsx
<div className="space-y-4">
  <div>
    <label>Name *</label>
    <Input placeholder="Enter participant name" />
  </div>
  <div>
    <label>Email (Optional)</label>
    <Input 
      type="email" 
      placeholder="participant@example.com"
      // Validation logic
    />
  </div>
</div>
```

### **Participant List Display**
- Show email below name (if provided)
- Use subtle styling for email
- Add email icon for visual clarity

## ⚠️ **Considerations**

### **Privacy**
- Make email optional for privacy-conscious users
- Add privacy notice about email usage
- Consider GDPR compliance for future

### **Validation**
- Email format validation
- Duplicate email prevention (within same group? globally?)
- Handle edge cases (invalid emails, long emails)

### **Backward Compatibility**
- Existing participants should continue working
- Optional email field for smooth migration
- Default behavior when email is not provided

## 🔗 **Related Features**

**Enables:**
- [Email Invitations](../high-impact/email-notifications.md)
- [Email Notifications](../high-impact/email-notifications.md)
- User authentication system

**Depends on:**
- Current participant management system

## 📊 **Success Criteria**

- [ ] Email field added to database without breaking existing data
- [ ] Users can optionally add email when creating participants
- [ ] Email validation works correctly
- [ ] No duplicate emails allowed within group
- [ ] Existing functionality remains unaffected
- [ ] Mobile-friendly email input

## 🐛 **Testing Checklist**

- [ ] Add participant with email
- [ ] Add participant without email
- [ ] Try to add duplicate email
- [ ] Enter invalid email format
- [ ] Edit existing participant to add email
- [ ] Test on mobile devices
- [ ] Verify database constraints work

## 📝 **Implementation Notes**

*Add implementation notes, code snippets, and learnings here as you work on this feature*

### **Code Snippets**

```typescript
// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### **Challenges Faced**

*Document any challenges and solutions here*

### **Useful Resources**

- [Supabase Schema Migration](https://supabase.com/docs/guides/database/migrations)
- [React Hook Form Email Validation](https://react-hook-form.com/get-started#Applyvalidation)
- [Email Regex Patterns](https://emailregex.com/)

---

**Next:** [Local Storage for Participants](./local-storage-participants.md)
