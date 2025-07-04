# 💾 Local Storage for Participants

**Status:** 📋 Planned  
**Priority:** 🔥 Immediate  
**Estimated Time:** 1-2 days  
**Dependencies:** None

## 📝 **Overview**

Implement local storage to remember participant selection across browser sessions, preventing users from being asked repeatedly who they are when visiting the same group.

## 🎯 **Goals**

1. **Persistent Identity:** Remember participant selection across sessions
2. **Improved UX:** Reduce friction for returning users
3. **Smart Defaults:** Automatically select known participant
4. **Privacy Respect:** Allow users to change/clear their identity

## 🔧 **Technical Implementation**

### **Current Behavior**
- Session storage clears when browser is closed
- Users must re-select identity every time they visit
- No persistence across devices/browsers

### **Proposed Solution**
- Use localStorage for long-term persistence
- Implement fallback to sessionStorage
- Add "Remember me" option
- Allow identity switching

### **Storage Strategy**

```typescript
// Storage keys
const STORAGE_KEYS = {
  PARTICIPANT_SELECTION: 'cashpaw_participant_selection',
  REMEMBER_PREFERENCE: 'cashpaw_remember_preference'
};

// Storage structure
interface ParticipantStorage {
  [groupId: string]: {
    participantId: string;
    participantName: string;
    rememberedAt: string;
    remember: boolean;
  };
}
```

## 📋 **Implementation Steps**

### Phase 1: Storage Utility Functions
- [ ] Create localStorage utility functions
- [ ] Implement fallback to sessionStorage
- [ ] Add error handling for storage unavailable
- [ ] Create participant storage interface

### Phase 2: Update Participant Selection Logic
- [ ] Modify ParticipantSelectionModal component
- [ ] Add "Remember my choice" checkbox
- [ ] Update GroupDashboard to check localStorage first
- [ ] Implement participant switching functionality

### Phase 3: UI Enhancements
- [ ] Add "Change participant" button/link
- [ ] Show current participant identity clearly
- [ ] Add option to forget/clear stored identity
- [ ] Privacy notice about local storage

### Phase 4: Edge Case Handling
- [ ] Handle participant no longer exists in group
- [ ] Handle localStorage quota exceeded
- [ ] Handle corrupted storage data
- [ ] Cross-browser compatibility testing

## 🎨 **UI Design**

### **Participant Selection Modal Updates**
```tsx
<div className="space-y-4">
  {/* Existing participant selection */}
  
  <div className="flex items-center space-x-2 pt-4 border-t">
    <Checkbox 
      id="remember" 
      checked={rememberChoice}
      onCheckedChange={setRememberChoice}
    />
    <label htmlFor="remember" className="text-sm">
      Remember my choice for this group
    </label>
  </div>
  
  <p className="text-xs text-gray-500">
    Your choice will be saved locally on this device
  </p>
</div>
```

### **Current Participant Display**
```tsx
<div className="flex items-center gap-2 text-sm text-gray-600">
  <User className="w-4 h-4" />
  <span>Viewing as: <strong>{currentParticipantName}</strong></span>
  <button 
    className="text-blue-600 hover:underline"
    onClick={openParticipantSelection}
  >
    Change
  </button>
</div>
```

## 🔧 **Code Implementation**

### **Storage Utilities**

```typescript
// src/utils/participantStorage.ts
export class ParticipantStorage {
  private static STORAGE_KEY = 'cashpaw_participant_selection';
  
  static saveParticipant(
    groupId: string, 
    participantId: string, 
    participantName: string,
    remember: boolean = false
  ): void {
    try {
      const storage = remember ? localStorage : sessionStorage;
      const existing = this.getAllSelections();
      
      existing[groupId] = {
        participantId,
        participantName,
        rememberedAt: new Date().toISOString(),
        remember
      };
      
      storage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to save participant selection:', error);
    }
  }
  
  static getParticipant(groupId: string): ParticipantSelection | null {
    try {
      // Check localStorage first, then sessionStorage
      const localData = localStorage.getItem(this.STORAGE_KEY);
      const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
      
      const data = localData || sessionData;
      if (!data) return null;
      
      const selections = JSON.parse(data);
      return selections[groupId] || null;
    } catch (error) {
      console.warn('Failed to get participant selection:', error);
      return null;
    }
  }
  
  static clearParticipant(groupId: string): void {
    // Clear from both storages
    [localStorage, sessionStorage].forEach(storage => {
      try {
        const data = storage.getItem(this.STORAGE_KEY);
        if (data) {
          const selections = JSON.parse(data);
          delete selections[groupId];
          storage.setItem(this.STORAGE_KEY, JSON.stringify(selections));
        }
      } catch (error) {
        console.warn('Failed to clear participant selection:', error);
      }
    });
  }
}
```

### **Component Updates**

```typescript
// In GroupDashboard.tsx
useEffect(() => {
  if (groupId && !currentParticipant) {
    // Check for stored participant selection
    const stored = ParticipantStorage.getParticipant(groupId);
    
    if (stored && group?.participants?.find(p => p.id === stored.participantId)) {
      setCurrentParticipant(stored.participantId);
      // Record group view for stored participant
      recordGroupView(groupId, stored.participantId);
    } else if (group?.participants?.length > 0) {
      setShowParticipantSelection(true);
    }
  }
}, [groupId, group, currentParticipant]);
```

## ⚠️ **Considerations**

### **Privacy & Security**
- Clear privacy notice about local storage usage
- No sensitive data in localStorage
- Option to clear all stored data
- Respect user's storage preferences

### **Storage Limitations**
- localStorage quota limits (5-10MB typically)
- Handle storage full errors gracefully
- Periodic cleanup of old data

### **Cross-Device Behavior**
- Storage is device/browser specific
- No sync across devices (feature for future)
- Clear user expectations

## 📊 **Success Criteria**

- [ ] Returning users don't see participant selection modal
- [ ] "Remember me" option works correctly
- [ ] Users can change their identity when needed
- [ ] Storage works across browser sessions
- [ ] Graceful fallback when storage unavailable
- [ ] No breaking changes to existing functionality

## 🐛 **Testing Checklist**

- [ ] Remember participant choice across browser restart
- [ ] Uncheck "remember me" uses session storage only
- [ ] Change participant identity works
- [ ] Handle participant no longer in group
- [ ] Test in incognito/private browsing mode
- [ ] Test with localStorage disabled
- [ ] Test storage quota exceeded scenario
- [ ] Cross-browser compatibility

## 📝 **Implementation Notes**

*Add implementation notes, code snippets, and learnings here*

### **Edge Cases to Handle**

1. **Participant Removed:** Stored participant no longer in group
2. **Storage Disabled:** Private browsing or storage blocked
3. **Data Corruption:** Invalid JSON in storage
4. **Quota Exceeded:** Storage full error

### **Future Enhancements**

- Sync across devices with user account
- Multiple group support in single interface
- Participant preferences storage
- Analytics on participant switching behavior

---

**Next:** [App Rebranding](./app-rebranding.md)
