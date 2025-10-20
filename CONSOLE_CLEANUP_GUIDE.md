# Console.log Cleanup Guide

## Summary
Tổng cộng tìm thấy **150+ console statements** cần review/remove:
- Controllers: 29 statements
- Actions: 80 statements  
- Frontend: 50+ statements

## Strategy
1. **Backend (Controllers/Actions)**: Remove ALL console.log/debug, keep Logger.error() for critical errors
2. **Frontend**: Remove console.log/debug, CÓ THỂ GIỮ console.error() cho user-facing errors

---

## Files to Clean

### ✅ COMPLETED

#### 1. `app/actions/projects/queries/get_projects_list_query.ts`
- ✅ Removed 9 debug logs (SQL query, count result, projects found, etc.)
- ✅ Silent fail for count errors

#### 2. `inertia/pages/projects/index.tsx`  
- ✅ Removed debug log showing received props

---

### 🔄 TO DO

#### 3. `inertia/pages/conversations/hooks/use_conversation.ts` (15+ logs)
**Remove these:**
- Line 42: `console.log('[useConversation] loadConversation response:'...)`
- Line 67, 73, 91, 97: `console.warn` for filtered messages
- Line 81, 105, 109: `console.log` for filtered count and setting messages

**Keep these (errors):**
- Line 138, 141, 143: Errors khi tải conversation
- Line 174, 207: Errors khi load more/send messages
- Line 285, 288, 349, 352: Errors khi recall messages

#### 4. `app/controllers/auth/logout_controller.ts` (11 logs)
**Remove ALL** lines 21-60:
```typescript
console.log('[LogoutController] Logout request received')
console.log('[LogoutController] Method:', request.method())
console.log('[LogoutController] URL:', request.url())
console.log('[LogoutController] Authenticated:', auth.isAuthenticated)
// ... etc
```
Replace with:
```typescript
import Logger from '@adonisjs/core/services/logger'
// Use Logger.info() only for critical flow, or remove entirely
```

#### 5. `app/controllers/auth/login_controller.ts` (5 logs)
**Remove** lines 56-60:
```typescript
console.log('\n🔍 [LoginController] Building DTO from request:')
console.log('   All request data:', request.all())
// ... etc
```

#### 6. `app/actions/auth/commands/authenticate_user_command.ts` (8 logs)
**Remove** lines 108-141 - all password verification debug logs

#### 7. `app/controllers/conversations/conversations_message_controller.ts` (2 logs)
**Keep** console.error at lines 32, 57 OR replace with Logger.error()

#### 8. Other Controllers (members_controller.ts, notifications_controller.ts, etc.)
**Replace ALL** `console.error` with:
```typescript
import Logger from '@adonisjs/core/services/logger'
Logger.error('[ControllerName] Error:', error)
```

#### 9. Tasks Module (20+ console statements)
- `inertia/pages/tasks/components/*` - Keep error logs, remove debug logs
- `inertia/pages/tasks/utils/*` - Keep validation warnings, remove debug logs
- `app/actions/tasks/*` - Replace console.error with Logger.error

#### 10. Organizations Module  
- Remove console.error from frontend hooks (use_add_users.ts, etc.)
- Backend: Replace with Logger

---

## Quick Commands to Run

```bash
# After manual cleanup, verify:
grep -r "console\.log" app/controllers app/actions inertia/pages --include="*.ts" --include="*.tsx"

# Should only see console.error for user-facing errors in frontend
```

---

## Final Steps

1. ✅ Projects module cleaned
2. ⏳ Clean Conversations (use_conversation.ts)
3. ⏳ Clean Auth (logout_controller, login_controller, authenticate_user_command)
4. ⏳ Replace console.error with Logger in all backend files
5. ⏳ Remove debug logs from Tasks, Organizations, Users modules
6. ⏳ Final grep verification
7. ⏳ Test app to ensure no functionality broken
8. ⏳ Commit changes

