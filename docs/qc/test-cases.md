# Test Cases - SWMS QC

## Scope
- Front-end: UI behavior, responsive, login, role navigation.
- White-box: Function logic in auth, role guard, task CRUD, project-employee mapping.

## Front-end Test Cases

| ID | Module | Preconditions | Steps | Expected |
|---|---|---|---|---|
| FE-LOGIN-001 | Login success | Open app at /index.html | Enter thanhlv / admin1234567, click login | Redirect to dashboard and show success toast |
| FE-LOGIN-002 | Login validation password length | Open /index.html | Enter cuonglm / user1234567, click login | If account exists in user store, should allow login |
| FE-ROLE-001 | Role restriction for project_manager | Logged in as thanhlv | Open /pages/employee-management/employees.html directly | Should block and redirect to account dashboard |
| FE-RESOURCE-001 | Static CSS resource load | Logged in user | Open /pages/accountdashboard/accountdashboard.html | No 404 static resources |
| FE-RESP-001 | Dashboard responsive mobile | Logged in user | Open account dashboard at 375x812 | No horizontal overflow |
| FE-RESP-002 | Personal dashboard responsive mobile | Logged in user | Open personal dashboard at 375x812 | No horizontal overflow |
| FE-FLOW-001 | Logout flow | Logged in user | Click Dang xuat on sidebar | Clear session and return login page |

## White-box Test Cases

| ID | Function | Input / Branch | Expected |
|---|---|---|---|
| WB-LOGIN-001 | findUserSignin | active user thanhlv/admin1234567 | Return user object |
| WB-LOGIN-002 | findUserSignin | inactive user viethq/user1234567 | Return null |
| WB-AUTH-001 | saveCurrentUser + getCurrentUser | save active user then read | Return normalized current user payload |
| WB-AUTH-002 | clearCurrentUser | clear then read | Return null |
| WB-ROLE-001 | canAccess | allowedRoles=[ADMIN], role=HR_MANAGER | Return true (alias) |
| WB-ROLE-002 | canAccess | allowedRoles=[PROJECT_MANAGER], role=EMPLOYEE | Return false |
| WB-TASK-001 | insertTask | valid task payload | New task created with generated taskCode |
| WB-TASK-002 | updateTask | existing task id + status=Done | Return updated task |
| WB-TASK-003 | deleteTask | existing task id | Return true |
| WB-TASK-004 | deleteTask | non-existent id | Return false |
| WB-PE-001 | addProjectEmployee | add same employee to same project twice | First create success, second return null |
| WB-PE-002 | addProjectEmployee | employeeCode not found | Return null |
